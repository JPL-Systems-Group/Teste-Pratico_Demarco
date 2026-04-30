namespace TechsysLog.API.Configuration;

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;

    // DECISION: Token expires in 24 hours to balance security and UX for this
    // operational panel (operators work in shifts). Refresh tokens were omitted
    // to reduce scope while meeting the JWT requirement.
    public int ExpirationHours { get; set; } = 24;
}
