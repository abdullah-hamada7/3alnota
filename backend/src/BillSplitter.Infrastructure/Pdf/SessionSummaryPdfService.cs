using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using BillSplitter.Application.Interfaces;

namespace BillSplitter.Infrastructure.Pdf;

public class SessionSummaryPdfService : ISessionPdfService
{
    public SessionSummaryPdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateSessionSummaryPdf(SessionSummary summary)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A5);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("El Messiri"));
                page.ContentFromRightToLeft();

                page.Header().Element(c => ComposeHeader(c, summary));
                page.Content().Element(c => ComposeContent(c, summary));
                page.Footer().Element(ComposeFooter);
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container, SessionSummary summary)
    {
        container.Column(column =>
        {
            column.Item().AlignCenter().Text("عالنوتة")
                .FontSize(22).Bold().FontColor("#c9653a");

            column.Item().AlignCenter().Text(summary.SessionName ?? "حسبة القعدة")
                .FontSize(16).Bold();

            column.Item().AlignCenter().Text($"رقم الحسبة: {summary.SessionId}")
                .FontSize(9).FontColor("#6b6258");

            column.Item().PaddingTop(10).LineHorizontal(1).LineColor("#e2e8f0");
        });
    }

    private void ComposeContent(IContainer container, SessionSummary summary)
    {
        container.PaddingVertical(10).Column(column =>
        {
            // Participants Summary
            column.Item().Text("مين دفع ومين عليه").FontSize(14).Bold().FontColor("#c9653a");
            column.Item().PaddingTop(5).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                });

                table.Header(header =>
                {
                    header.Cell().Background("#f5f0e8").Padding(5).Text("الاسم").Bold();
                    header.Cell().Background("#f5f0e8").Padding(5).AlignRight().Text("دفع كام").Bold();
                    header.Cell().Background("#f5f0e8").Padding(5).AlignRight().Text("حسابه").Bold();
                    header.Cell().Background("#f5f0e8").Padding(5).AlignRight().Text("ليه/عليه").Bold();
                });

                foreach (var p in summary.Participants)
                {
                    table.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(5).Text(p.DisplayName);
                    table.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(5).AlignRight().Text($"{p.PaidAmount:F2}");
                    table.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(5).AlignRight().Text($"{p.FinalAmount:F2}");

                    var balanceColor = p.Balance > 0 ? "#5d9b6b" : p.Balance < 0 ? "#c75050" : "#1e293b";
                    var balanceText = p.Balance > 0 ? $"+{p.Balance:F2}" : $"{p.Balance:F2}";
                    table.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(5).AlignRight()
                        .Text(balanceText).FontColor(balanceColor).Bold();
                }
            });

            // Items
            if (summary.Items.Any())
            {
                column.Item().PaddingTop(15).Text("الحاجات اللي اتطلبت").FontSize(14).Bold().FontColor("#c9653a");
                column.Item().PaddingTop(5).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(1);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Background("#f5f0e8").Padding(5).Text("الطلب").Bold();
                        header.Cell().Background("#f5f0e8").Padding(5).AlignRight().Text("السعر").Bold();
                        header.Cell().Background("#f5f0e8").Padding(5).AlignRight().Text("بتاع مين").Bold();
                    });

                    foreach (var item in summary.Items)
                    {
                        table.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(5).Text(item.Name);
                        table.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(5).AlignRight().Text($"{item.Amount:F2}");
                        table.Cell().BorderBottom(1).BorderColor("#e2e8f0").Padding(5).AlignRight().Text(item.AssignedTo);
                    }
                });
            }

            // Totals
            column.Item().PaddingTop(15).Row(row =>
            {
                row.RelativeItem().Text("الحساب الأصلي:").Bold();
                row.ConstantItem(80).AlignRight().Text($"{summary.Subtotal:F2}");
            });

            if (summary.TotalCharges > 0)
            {
                column.Item().Row(row =>
                {
                    row.RelativeItem().Text("الخدمة والضريبة:");
                    row.ConstantItem(80).AlignRight().Text($"{summary.TotalCharges:F2}");
                });
            }

            column.Item().PaddingTop(5).BorderTop(1).BorderColor("#c9653a").PaddingTop(5).Row(row =>
            {
                row.RelativeItem().Text("كله على بعضه:").Bold().FontSize(12);
                row.ConstantItem(100).AlignRight().Text($"{summary.GrandTotal:F2}").FontSize(12).Bold().FontColor("#c9653a");
            });

            // Settlements
            if (summary.Settlements.Any())
            {
                column.Item().PaddingTop(20).Text("التصفية (مين يدي مين)").FontSize(14).Bold().FontColor("#c9653a");
                column.Item().PaddingTop(5).Column(column =>
                {
                    foreach (var s in summary.Settlements)
                    {
                        column.Item().PaddingVertical(3).Row(row =>
                        {
                            row.RelativeItem().Text($"{s.FromParticipant} ← يدي ← {s.ToParticipant}");
                            row.ConstantItem(80).AlignRight().Text($"{s.Amount:F2} ج.م").Bold();
                        });
                    }
                });
            }
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.Column(column =>
        {
            column.Item().LineHorizontal(1).LineColor("#e2e8f0");
            column.Item().PaddingTop(5).Row(row =>
            {
                row.RelativeItem().Text("اتعملت بحب في عالنوتة 💚 - بوضوح ومن غير لخبطة!")
                    .FontSize(8).FontColor("#6b6258");
                
                row.RelativeItem().AlignRight().Text("عالنوتة - Created by Abdullah Hamada")
                    .FontSize(8).FontColor("#6b6258").Italic();
            });
        });
    }
}