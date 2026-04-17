using BillSplitter.Domain.Entities;
using BillSplitter.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BillSplitter.Infrastructure.Persistence.Configurations;

public class SessionChargeConfiguration : IEntityTypeConfiguration<SessionCharge>
{
    public void Configure(EntityTypeBuilder<SessionCharge> builder)
    {
        builder.ToTable("SessionCharges");
        
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedNever();
        
        builder.Property(c => c.Type)
            .HasConversion<string>()
            .HasMaxLength(20);
        
        builder.Property(c => c.Amount)
            .HasConversion(v => v.Amount, v => Money.FromDecimal(v))
            .HasPrecision(18, 2);
    }
}