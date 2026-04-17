using BillSplitter.Domain.Entities;
using BillSplitter.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BillSplitter.Infrastructure.Persistence.Configurations;

public class ParticipantConfiguration : IEntityTypeConfiguration<Participant>
{
    public void Configure(EntityTypeBuilder<Participant> builder)
    {
        builder.ToTable("Participants");
        
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedNever();
        
        builder.Property(p => p.DisplayName)
            .HasMaxLength(100)
            .IsRequired();
        
        builder.Property(p => p.PaidAmount)
            .HasConversion(v => v.Amount, v => Money.FromDecimal(v))
            .HasPrecision(18, 2);
        
        builder.Property(p => p.CalculatedSubtotal)
            .HasConversion(v => v.Amount, v => Money.FromDecimal(v))
            .HasPrecision(18, 2);
        
        builder.Property(p => p.AllocatedCharges)
            .HasConversion(v => v.Amount, v => Money.FromDecimal(v))
            .HasPrecision(18, 2);
        
        builder.Property(p => p.FinalAmount)
            .HasConversion(v => v.Amount, v => Money.FromDecimal(v))
            .HasPrecision(18, 2);
        
        builder.Property(p => p.Balance)
            .HasConversion(v => v.Amount, v => Money.FromDecimal(v))
            .HasPrecision(18, 2);
        
        builder.HasIndex(p => new { p.SessionId, p.DisplayName })
            .IsUnique();
    }
}