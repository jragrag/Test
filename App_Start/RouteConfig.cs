using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace MorganLewis.PracticeStrategy.PricingCentral.UI
{
    public static class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Client",
                url: "Client/GeneratePdf/{id}",
                defaults: new
                {
                    controller = "Client",
                    action = "GeneratePdf",
                    id = UrlParameter.Optional
                }
            );

            routes.MapRoute(
                name: "RelatedClient",
                url: "RelatedClient/GeneratePdf/{id}",
                defaults: new
                {
                    controller = "RelatedClient",
                    action = "GeneratePdf",
                    id = UrlParameter.Optional
                }
            );
        }
    }
}