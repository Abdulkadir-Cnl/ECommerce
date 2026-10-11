// Application/DTOs/AddressDto.cs (YENİ)
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class AddressDto
    {
        [Required] public string Title { get; set; }
        [Required] public string Street { get; set; }
        [Required] public string City { get; set; }
        [Required] public string State { get; set; }
        [Required] public string ZipCode { get; set; }
        [Required] public string Country { get; set; }
    }
}