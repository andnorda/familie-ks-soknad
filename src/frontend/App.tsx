import React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';

import AppContainer from './AppContainer';
import AlertStripe from './components/Felleskomponenter/AlertStripe/AlertStripe';
import { AppProvider } from './context/AppContext';
import { AppNavigationProvider } from './context/AppNavigationContext';
import { EøsProvider } from './context/EøsContext';
import { FeatureTogglesProvider } from './context/FeatureToggleContext';
import { InnloggetProvider } from './context/InnloggetContext';
import { LastRessurserProvider } from './context/LastRessurserContext';
import { RoutesProvider } from './context/RoutesContext';
import { SanityProvider } from './context/SanityContext';
import { StegProvider } from './context/StegContext';
import { routerBasePath } from './Miljø';
import { GlobalStyle } from './Theme';

function App() {
    return (
        <LastRessurserProvider>
            <SanityProvider>
                <InnloggetProvider>
                    <FeatureTogglesProvider>
                        <AppProvider>
                            <EøsProvider>
                                <RoutesProvider>
                                    <Router basename={routerBasePath}>
                                        <StegProvider>
                                            <GlobalStyle />
                                            {
                                                // todo: Kommentere denne inn når vi går live
                                                //process.env.NODE_ENV !== 'production' && (
                                                <AlertStripe variant="warning">
                                                    {`Denne siden er under utvikling. `}
                                                    <a href="https://www.nav.no/kontantstotte">
                                                        Klikk her for å gå til våre sider for
                                                        kontantstøtte
                                                    </a>
                                                </AlertStripe>
                                                //)
                                            }
                                            <AppNavigationProvider>
                                                <AppContainer />
                                            </AppNavigationProvider>
                                        </StegProvider>
                                    </Router>
                                </RoutesProvider>
                            </EøsProvider>
                        </AppProvider>
                    </FeatureTogglesProvider>
                </InnloggetProvider>
            </SanityProvider>
        </LastRessurserProvider>
    );
}

export default App;
