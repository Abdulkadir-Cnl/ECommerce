using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BasketController : ControllerBase
    {
        private readonly IBasketService _basketService;

        public BasketController(IBasketService basketService)
        {
            _basketService = basketService;
        }

        private string GetUserId() =>
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        [HttpGet]
        public async Task<IActionResult> GetBasket()
        {
            return Ok(await _basketService.GetBasketAsync(GetUserId()));
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddItem(int productId, int quantity = 1)
        {
            await _basketService.AddItemToBasketAsync(GetUserId(), productId, quantity);
            return Ok();
        }

        [HttpDelete("remove/{productId}")]
        public async Task<IActionResult> RemoveItem(int productId)
        {
            await _basketService.RemoveItemFromBasketAsync(GetUserId(), productId);
            return Ok();
        }
    }
}
