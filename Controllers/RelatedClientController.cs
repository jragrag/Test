using Common.Notification;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mime;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace MorganLewis.PracticeStrategy.PricingCentral.UI.Controllers
{
    public class RelatedClientController : Controller
    {
        // GET: RelatedClient
        public ActionResult Index()
        {
            return View();
        } 
    }
}