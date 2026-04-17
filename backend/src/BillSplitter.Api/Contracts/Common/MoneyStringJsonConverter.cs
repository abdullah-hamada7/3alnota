using System.Text.Json;
using System.Text.Json.Serialization;
using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Api.Contracts.Common;

public class MoneyStringJsonConverter : JsonConverter<Money>
{
    public override Money Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetDecimal();
        return Money.FromDecimal(value);
    }

    public override void Write(Utf8JsonWriter writer, Money value, JsonSerializerOptions options)
    {
        var displayValue = Math.Round(value.Amount, 2, MidpointRounding.ToEven);
        writer.WriteStringValue(displayValue.ToString("F2"));
    }
}