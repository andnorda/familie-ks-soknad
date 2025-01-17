import { NextFunction, Request, RequestHandler, Response } from 'express';

import { LOG_LEVEL } from '@navikt/familie-logging';
import { requestOboToken, validateToken } from '@navikt/oasis';

import { erLokalt } from '../../shared-utils/Miljø';
import { logRequest } from '../logger';
import { ApplicationName } from '../types';

export const AUTHORIZATION_HEADER = 'authorization';
const WONDERWALL_ID_TOKEN_HEADER = 'x-wonderwall-id-token';

const attachToken = (applicationName: ApplicationName): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authenticationHeader = await prepareSecuredRequest(req, applicationName);
            req.headers[AUTHORIZATION_HEADER] = authenticationHeader.authorization;
            req.headers[WONDERWALL_ID_TOKEN_HEADER] = '';
            next();
        } catch (error) {
            logRequest(
                req,
                `Noe gikk galt ved setting av token (${req.method} - ${req.path}): `,
                LOG_LEVEL.WARNING,
                error
            );
            return res.status(401).send('En uventet feil oppstod. Ingen gyldig token');
        }
    };
};

const harBearerToken = (authorization: string) => {
    return authorization.includes('Bearer ');
};

const utledToken = (req: Request, authorization: string | undefined): string => {
    if (erLokalt()) {
        return req.cookies['localhost-idtoken'];
    } else if (authorization && harBearerToken(authorization)) {
        return authorization.split(' ')[1];
    } else {
        throw Error('Mangler authorization i header');
    }
};

const prepareSecuredRequest = async (req: Request, applicationName: ApplicationName) => {
    logRequest(req, 'PrepareSecuredRequest', LOG_LEVEL.INFO);
    const { authorization } = req.headers;
    const token = utledToken(req, authorization);
    if (erLokalt()) {
        return {
            authorization: `Bearer ${token}`,
        };
    }
    logRequest(req, 'IdPorten-token found: ' + (token.length > 1), LOG_LEVEL.INFO);

    const validation = await validateToken(token);
    if (!validation.ok) {
        // TODO: handle validation error
        throw validation.error;
    }

    const obo = await requestOboToken(
        token,
        `${process.env.NAIS_CLUSTER_NAME}:teamfamilie:${applicationName}`
    );
    if (!obo.ok) {
        // TODO: handle obo error
        throw obo.error;
    }
    return {
        authorization: `Bearer ${obo.token}`,
    };
};

export default attachToken;
