using System.Web;
using System.Web.Mvc;

namespace MorganLewis.PracticeStrategy.PricingCentral.UI
{
    public static class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {            
            filters.Add(new HandleErrorAttribute());
        }
    }
}
