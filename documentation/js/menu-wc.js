'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">mkgtru-api documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/DocumentationStaticModule.html" data-type="entity-link" >DocumentationStaticModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-DocumentationStaticModule-711e756dd0f6b2fc39b5dc5ffc2d6116f1e734c25ae97e88b95367ca3e762337c5ae5e1e2e4ab2f03691ca073275303c7199b8bf12485ee0194a6082dc9ba67d"' : 'data-target="#xs-controllers-links-module-DocumentationStaticModule-711e756dd0f6b2fc39b5dc5ffc2d6116f1e734c25ae97e88b95367ca3e762337c5ae5e1e2e4ab2f03691ca073275303c7199b8bf12485ee0194a6082dc9ba67d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-DocumentationStaticModule-711e756dd0f6b2fc39b5dc5ffc2d6116f1e734c25ae97e88b95367ca3e762337c5ae5e1e2e4ab2f03691ca073275303c7199b8bf12485ee0194a6082dc9ba67d"' :
                                            'id="xs-controllers-links-module-DocumentationStaticModule-711e756dd0f6b2fc39b5dc5ffc2d6116f1e734c25ae97e88b95367ca3e762337c5ae5e1e2e4ab2f03691ca073275303c7199b8bf12485ee0194a6082dc9ba67d"' }>
                                            <li class="link">
                                                <a href="controllers/DocumentationStaticController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DocumentationStaticController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-DocumentationStaticModule-711e756dd0f6b2fc39b5dc5ffc2d6116f1e734c25ae97e88b95367ca3e762337c5ae5e1e2e4ab2f03691ca073275303c7199b8bf12485ee0194a6082dc9ba67d"' : 'data-target="#xs-injectables-links-module-DocumentationStaticModule-711e756dd0f6b2fc39b5dc5ffc2d6116f1e734c25ae97e88b95367ca3e762337c5ae5e1e2e4ab2f03691ca073275303c7199b8bf12485ee0194a6082dc9ba67d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DocumentationStaticModule-711e756dd0f6b2fc39b5dc5ffc2d6116f1e734c25ae97e88b95367ca3e762337c5ae5e1e2e4ab2f03691ca073275303c7199b8bf12485ee0194a6082dc9ba67d"' :
                                        'id="xs-injectables-links-module-DocumentationStaticModule-711e756dd0f6b2fc39b5dc5ffc2d6116f1e734c25ae97e88b95367ca3e762337c5ae5e1e2e4ab2f03691ca073275303c7199b8bf12485ee0194a6082dc9ba67d"' }>
                                        <li class="link">
                                            <a href="injectables/DocumentationStaticService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DocumentationStaticService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MkgtOfficialBotModule.html" data-type="entity-link" >MkgtOfficialBotModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-MkgtOfficialBotModule-dc229c54fb90f71ce6a45a017d501dff87f8d1517458b872594c7726ff630a27fdcc2ccc73bd2996c38f8a4fd0f3f56071845550f5beaf895088b91ae67682b0"' : 'data-target="#xs-controllers-links-module-MkgtOfficialBotModule-dc229c54fb90f71ce6a45a017d501dff87f8d1517458b872594c7726ff630a27fdcc2ccc73bd2996c38f8a4fd0f3f56071845550f5beaf895088b91ae67682b0"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-MkgtOfficialBotModule-dc229c54fb90f71ce6a45a017d501dff87f8d1517458b872594c7726ff630a27fdcc2ccc73bd2996c38f8a4fd0f3f56071845550f5beaf895088b91ae67682b0"' :
                                            'id="xs-controllers-links-module-MkgtOfficialBotModule-dc229c54fb90f71ce6a45a017d501dff87f8d1517458b872594c7726ff630a27fdcc2ccc73bd2996c38f8a4fd0f3f56071845550f5beaf895088b91ae67682b0"' }>
                                            <li class="link">
                                                <a href="controllers/MkgtOfficialBotController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MkgtOfficialBotController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-MkgtOfficialBotModule-dc229c54fb90f71ce6a45a017d501dff87f8d1517458b872594c7726ff630a27fdcc2ccc73bd2996c38f8a4fd0f3f56071845550f5beaf895088b91ae67682b0"' : 'data-target="#xs-injectables-links-module-MkgtOfficialBotModule-dc229c54fb90f71ce6a45a017d501dff87f8d1517458b872594c7726ff630a27fdcc2ccc73bd2996c38f8a4fd0f3f56071845550f5beaf895088b91ae67682b0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MkgtOfficialBotModule-dc229c54fb90f71ce6a45a017d501dff87f8d1517458b872594c7726ff630a27fdcc2ccc73bd2996c38f8a4fd0f3f56071845550f5beaf895088b91ae67682b0"' :
                                        'id="xs-injectables-links-module-MkgtOfficialBotModule-dc229c54fb90f71ce6a45a017d501dff87f8d1517458b872594c7726ff630a27fdcc2ccc73bd2996c38f8a4fd0f3f56071845550f5beaf895088b91ae67682b0"' }>
                                        <li class="link">
                                            <a href="injectables/MkgtOfficialBotService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MkgtOfficialBotService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MkgtruApiModule.html" data-type="entity-link" >MkgtruApiModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-MkgtruApiModule-24c2ba428b67d241fdbd95ee55d52d6a7237125aa641e254cbbd2e01fe282b4aea6f6df4eeffeb69d865adc919d0cbffa7225497c39581134f089159476cb33f"' : 'data-target="#xs-controllers-links-module-MkgtruApiModule-24c2ba428b67d241fdbd95ee55d52d6a7237125aa641e254cbbd2e01fe282b4aea6f6df4eeffeb69d865adc919d0cbffa7225497c39581134f089159476cb33f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-MkgtruApiModule-24c2ba428b67d241fdbd95ee55d52d6a7237125aa641e254cbbd2e01fe282b4aea6f6df4eeffeb69d865adc919d0cbffa7225497c39581134f089159476cb33f"' :
                                            'id="xs-controllers-links-module-MkgtruApiModule-24c2ba428b67d241fdbd95ee55d52d6a7237125aa641e254cbbd2e01fe282b4aea6f6df4eeffeb69d865adc919d0cbffa7225497c39581134f089159476cb33f"' }>
                                            <li class="link">
                                                <a href="controllers/MkgtruApiController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MkgtruApiController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-MkgtruApiModule-24c2ba428b67d241fdbd95ee55d52d6a7237125aa641e254cbbd2e01fe282b4aea6f6df4eeffeb69d865adc919d0cbffa7225497c39581134f089159476cb33f"' : 'data-target="#xs-injectables-links-module-MkgtruApiModule-24c2ba428b67d241fdbd95ee55d52d6a7237125aa641e254cbbd2e01fe282b4aea6f6df4eeffeb69d865adc919d0cbffa7225497c39581134f089159476cb33f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MkgtruApiModule-24c2ba428b67d241fdbd95ee55d52d6a7237125aa641e254cbbd2e01fe282b4aea6f6df4eeffeb69d865adc919d0cbffa7225497c39581134f089159476cb33f"' :
                                        'id="xs-injectables-links-module-MkgtruApiModule-24c2ba428b67d241fdbd95ee55d52d6a7237125aa641e254cbbd2e01fe282b4aea6f6df4eeffeb69d865adc919d0cbffa7225497c39581134f089159476cb33f"' }>
                                        <li class="link">
                                            <a href="injectables/MkgtruApiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MkgtruApiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#controllers-links"' :
                                'data-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/DocumentationStaticController.html" data-type="entity-link" >DocumentationStaticController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/MkgtOfficialBotController.html" data-type="entity-link" >MkgtOfficialBotController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/MkgtruApiController.html" data-type="entity-link" >MkgtruApiController</a>
                                </li>
                            </ul>
                        </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/DocumentationStaticService.html" data-type="entity-link" >DocumentationStaticService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MkgtOfficialBotService.html" data-type="entity-link" >MkgtOfficialBotService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MkgtruApiService.html" data-type="entity-link" >MkgtruApiService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/RequireApiKeyGuard.html" data-type="entity-link" >RequireApiKeyGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/IBotCommand.html" data-type="entity-link" >IBotCommand</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITitledDocumentInfo.html" data-type="entity-link" >ITitledDocumentInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITokenResponse.html" data-type="entity-link" >ITokenResponse</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});