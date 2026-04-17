using Microsoft.EntityFrameworkCore;
using BillSplitter.Domain.Entities;

namespace BillSplitter.Infrastructure.Persistence;

public class BillSplitterDbContext : DbContext
{
    public BillSplitterDbContext(DbContextOptions<BillSplitterDbContext> options) : base(options) { }

    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Participant> Participants => Set<Participant>();
    public DbSet<BillItem> BillItems => Set<BillItem>();
    public DbSet<ItemAssignment> ItemAssignments => Set<ItemAssignment>();
    public DbSet<SessionCharge> SessionCharges => Set<SessionCharge>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BillSplitterDbContext).Assembly);
    }
}