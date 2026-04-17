using BillSplitter.Domain.Entities;
using BillSplitter.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BillSplitter.Infrastructure.Persistence.Configurations;

public class BillItemConfiguration : IEntityTypeConfiguration<BillItem>
{
    public void Configure(EntityTypeBuilder<BillItem> builder)
    {
        builder.ToTable("BillItems");
        
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedNever();
        
        builder.Property(i => i.Name)
            .HasMaxLength(200)
            .IsRequired();
        
        builder.Property(i => i.Amount)
            .HasConversion(v => v.Amount, v => Money.FromDecimal(v))
            .HasPrecision(18, 2);
        
        builder.HasMany(i => i.Assignments)
            .WithOne()
            .HasForeignKey(a => a.BillItemId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}