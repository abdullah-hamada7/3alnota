using BillSplitter.Application.Interfaces;
using BillSplitter.Domain.Entities;
using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Application.Services.Sessions;

public class UpsertParticipantService
{
    private readonly ISessionRepository _repository;

    public UpsertParticipantService(ISessionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Participant> UpsertAsync(Guid sessionId, UpsertParticipantRequest request, CancellationToken ct = default)
    {
        var session = await _repository.GetByIdAsync(sessionId, ct)
            ?? throw new InvalidOperationException("Session not found");

        var existingParticipant = session.Participants
            .FirstOrDefault(p => p.Id == request.ParticipantId);

        if (existingParticipant != null)
        {
            if (!string.IsNullOrWhiteSpace(request.DisplayName))
            {
                existingParticipant.UpdateDisplayName(request.DisplayName);
            }
            await _repository.UpdateAsync(session, ct);
            return existingParticipant;
        }

        var sortOrder = session.Participants.Count;
        var participant = Participant.Create(request.DisplayName, sortOrder);
        session.AddParticipant(participant);
        await _repository.UpdateAsync(session, ct);
        return participant;
    }

    public async Task DeleteAsync(Guid sessionId, Guid participantId, CancellationToken ct = default)
    {
        var session = await _repository.GetByIdAsync(sessionId, ct)
            ?? throw new InvalidOperationException("Session not found");

        session.RemoveParticipant(participantId);
        await _repository.UpdateAsync(session, ct);
    }
}

public class UpsertParticipantRequest
{
    public Guid? ParticipantId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
}