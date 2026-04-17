using BillSplitter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BillSplitter.Infrastructure.Persistence.Configurations;

public class ItemAssignmentConfiguration : IEntityTypeConfiguration<ItemAssignment>
{
    public void Configure(EntityTypeBuilder<ItemAssignment> builder)
    {
        builder.ToTable("ItemAssignments");
        
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedNever();
        
        builder.Property(a => a.RatioNumerator)
            .IsRequired();
        
        builder.Property(a => a.RatioDenominator)
            .IsRequired();
        
        builder.HasIndex(a => new { a.BillItemId, a.ParticipantId })
            .IsUnique();
    }
}