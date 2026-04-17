using BillSplitter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BillSplitter.Infrastructure.Persistence.Configurations;

public class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.ToTable("Sessions");
        
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedNever();
        
        builder.Property(s => s.Name)
            .HasMaxLength(200);
        
        builder.Property(s => s.Currency)
            .HasMaxLength(3)
            .HasDefaultValue("EGP");
        
        builder.Property(s => s.OrganizerTokenHash)
            .HasMaxLength(100)
            .IsRequired();
        
        builder.Property(s => s.ViewerTokenHash)
            .HasMaxLength(100)
            .IsRequired();
        
        builder.Property(s => s.Status)
            .HasConversion<string>()
            .HasMaxLength(20);
        
        builder.Property(s => s.RoundingMode)
            .HasMaxLength(50)
            .HasDefaultValue("half-up-2-decimals");
        
        builder.Property(s => s.CreatedAtUtc)
            .HasPrecision(3);
        
        builder.Property(s => s.UpdatedAtUtc)
            .HasPrecision(3);
        
        builder.HasMany(s => s.Participants)
            .WithOne()
            .HasForeignKey(p => p.SessionId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasMany(s => s.Items)
            .WithOne()
            .HasForeignKey(i => i.SessionId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasMany(s => s.Charges)
            .WithOne()
            .HasForeignKey(c => c.SessionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}