using System.Text.Json;
using System.Text.Json.Serialization;

namespace TechsysLog.API.Services;

// Internal model used only to deserialize the ViaCEP API response.
// [JsonPropertyName] here controls reading from ViaCEP, not the outbound response.
internal class ViaCepApiResponse
{
    [JsonPropertyName("cep")]
    public string Cep { get; set; } = string.Empty;

    [JsonPropertyName("logradouro")]
    public string Logradouro { get; set; } = string.Empty;

    [JsonPropertyName("bairro")]
    public string Bairro { get; set; } = string.Empty;

    [JsonPropertyName("localidade")]
    public string Localidade { get; set; } = string.Empty;

    [JsonPropertyName("uf")]
    public string Uf { get; set; } = string.Empty;

    [JsonPropertyName("erro")]
    public bool? Erro { get; set; }
}

// Public DTO returned to the Angular client.
// Property names are serialized as camelCase by ASP.NET Core (cep, street, neighborhood, city, state).
public class ViaCepResponse
{
    public string Cep { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
}

public class ViaCepService
{
    private readonly HttpClient _http;
    private readonly ILogger<ViaCepService> _logger;

    public ViaCepService(HttpClient http, ILogger<ViaCepService> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<ViaCepResponse?> GetAddressByCepAsync(string cep)
    {
        // ViaCEP accepts only the 8 raw digits — strip dash and whitespace
        var cleanCep = cep.Replace("-", "").Trim();

        if (cleanCep.Length != 8)
            return null;

        try
        {
            var response = await _http.GetAsync($"https://viacep.com.br/ws/{cleanCep}/json/");
            if (!response.IsSuccessStatusCode)
                return null;

            var content = await response.Content.ReadAsStringAsync();
            var raw = JsonSerializer.Deserialize<ViaCepApiResponse>(content);

            if (raw?.Erro == true)
                return null;

            return new ViaCepResponse
            {
                Cep = raw!.Cep,
                Street = raw.Logradouro,
                Neighborhood = raw.Bairro,
                City = raw.Localidade,
                State = raw.Uf
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "ViaCEP lookup failed for CEP {Cep}", cleanCep);
            return null;
        }
    }
}
