using System.ComponentModel.DataAnnotations;

namespace TechsysLog.API.DTOs.Orders;

public class CreateOrderRequest
{
    [Required]
    public string OrderNumber { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Value must be greater than zero.")]
    public decimal Value { get; set; }

    [Required]
    public CreateOrderAddressRequest Address { get; set; } = new();
}

public class CreateOrderAddressRequest
{
    [Required]
    [RegularExpression(@"^\d{5}-?\d{3}$", ErrorMessage = "Invalid CEP format.")]
    public string CEP { get; set; } = string.Empty;

    [Required]
    public string Street { get; set; } = string.Empty;

    [Required]
    public string Number { get; set; } = string.Empty;

    [Required]
    public string Neighborhood { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    [Required]
    [MaxLength(2)]
    public string State { get; set; } = string.Empty;
}
