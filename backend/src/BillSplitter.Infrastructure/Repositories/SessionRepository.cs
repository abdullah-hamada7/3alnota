using BillSplitter.Application.Interfaces;
using BillSplitter.Domain.Entities;
using BillSplitter.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BillSplitter.Infrastructure.Repositories;

public class SessionRepository : ISessionRepository
{
    private readonly BillSplitterDbContext _context;

    public SessionRepository(BillSplitterDbContext context)
    {
        _context = context;
    }

    public async Task<Session?> GetByIdAsync(Guid sessionId, CancellationToken ct = default)
    {
        return await _context.Sessions
            .Include(s => s.Participants)
            .Include(s => s.Items)
                .ThenInclude(i => i.Assignments)
            .Include(s => s.Charges)
            .FirstOrDefaultAsync(s => s.Id == sessionId, ct);
    }

    public async Task<Session> CreateAsync(Session session, CancellationToken ct = default)
    {
        _context.Sessions.Add(session);
        await _context.SaveChangesAsync(ct);
        return session;
    }

    public async Task UpdateAsync(Session session, CancellationToken ct = default)
    {
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid sessionId, CancellationToken ct = default)
    {
        var session = await _context.Sessions.FindAsync(new object[] { sessionId }, ct);
        if (session != null)
        {
            _context.Sessions.Remove(session);
            await _context.SaveChangesAsync(ct);
        }
    }
}