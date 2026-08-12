self.__MIDDLEWARE_MATCHERS = [
  {
    "regexp": "^\\/nepaltechbrief(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next|api|favicon.ico|sitemap.xml|robots.txt|feed.xml).*))(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$",
    "originalSource": "/((?!_next|api|favicon.ico|sitemap.xml|robots.txt|feed.xml).*)"
  }
];self.__MIDDLEWARE_MATCHERS_CB && self.__MIDDLEWARE_MATCHERS_CB()