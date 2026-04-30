using System.Text.Json;
using System.Text.Json.Serialization;

namespace TechsysLog.API.Services;

public class ViaCepResponse
{
    [JsonPropertyName("cep")]
    public string CEP { get; set; } = string.Empty;

    [JsonPropertyName("logradouro")]
    public string Street { get; set; } = string.Empty;

    [JsonPropertyName("bairro")]
    public string Neighborhood { get; set; } = string.Empty;

    [JsonPropertyName("localidade")]
    public string City { get; set; } = string.Empty;

    [JsonPropertyName("uf")]
    public string State { get; set; } = string.Empty;

    // ViaCEP returns "erro": true when CEP is not found
    [JsonPropertyName("erro")]
    public bool? Erro { get; set; }
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
        // Strip formatting; ViaCEP accepts only digits
        var cleanCep = cep.Replace("-", "").Trim();

        try
        {
            var response = await _http.GetAsync($"https://viacep.com.br/ws/{cleanCep}/json/");
            if (!response.IsSuccessStatusCode)
                return null;

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<ViaCepResponse>(content);

            return result?.Erro == true ? null : result;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "ViaCEP lookup failed for CEP {Cep}", cleanCep);
            return null;
        }
    }
}
