using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Security.Claims;

namespace MorganLewis.PracticeStrategy.PricingCentral.UI.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Controller method that gets the username of the user from claims.
        /// </summary>
        /// <returns>The username of the user</returns>
        public JsonResult GetCurrentUser()
        {
            var currentPrincipal = ClaimsPrincipal.Current;
            var username = currentPrincipal.Claims.First(p => p.Type == ClaimTypes.Name).Value;
            return Json(username, JsonRequestBehavior.AllowGet);
        }

    }
}