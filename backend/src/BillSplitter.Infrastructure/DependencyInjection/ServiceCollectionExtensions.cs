using BillSplitter.Application.Interfaces;
using BillSplitter.Application.Services.Sessions;
using BillSplitter.Domain.Services;
using BillSplitter.Infrastructure.Persistence;
using BillSplitter.Infrastructure.Pdf;
using BillSplitter.Infrastructure.Repositories;
using BillSplitter.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BillSplitter.Infrastructure.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBillSplitterServices(this IServiceCollection services, string connectionString)
    {
        services.AddScoped<ISessionRepository, SessionRepository>();
        services.AddScoped<ISessionTokenService, SessionTokenService>();
        services.AddSingleton<ISessionPdfService, SessionSummaryPdfService>();
        services.AddScoped<SettlementCalculator>();
        services.AddScoped<SessionCalculationService>();
        
        services.AddScoped<CreateSessionService>();
        services.AddScoped<UpsertParticipantService>();
        services.AddScoped<UpsertBillItemService>();
        services.AddScoped<ReplaceChargesService>();
        services.AddScoped<ReplacePaymentsService>();
        services.AddScoped<Application.Services.Sessions.CalculateSessionService>();

        return services;
    }
}