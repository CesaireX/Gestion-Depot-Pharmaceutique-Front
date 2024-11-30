import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Injectable({
    providedIn: 'root'
})
export class HistoriquesPdfService {
    constructor() { }

    exportPDF(data: any[], headers: string[], title: string, fileName: string, dateInfo: any, totals?: any, clientInfo?: any) {
        const doc = new jsPDF('p', 'mm', 'a4');
        const formattedDate = this.formatDate(dateInfo);

        const head = [headers];
        const body = data.map(item => headers.map(header => item[header]));

        let yPos = 30; // Initial position below the title

        // Draw title
        const drawHeader = (doc) => {
            doc.setFont('Calibri', 'bold');
            const pageWidth = doc.internal.pageSize.getWidth();
            const titleText = `${title} ${formattedDate}`;
            const textWidth = doc.getTextWidth(titleText);
            const textX = (pageWidth - textWidth) / 2;

            doc.text(titleText, textX, 20);
            doc.setLineWidth(0.5);
            doc.line(textX, 22, textX + textWidth, 22); // Dessiner la ligne sous le texte
        }
        drawHeader(doc);

        // Add client information and totals side by side
        if (clientInfo && totals) {
            // Client Info Column
            doc.setFontSize(12);
            doc.setFont('Calibri', 'bold');
            let clientColumnX = 10;
            let totalColumnX = 120; // Adjust this value to position the totals column

            let clientInfoY = yPos;
            Object.entries(clientInfo).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`, clientColumnX, clientInfoY);
                clientInfoY += 10; // Adjust position for next line
            });

            // Totals Column
            let totalsY = yPos; // Reset Y position for totals
            doc.setFont('Calibri', 'bold');
            Object.entries(totals).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`, totalColumnX, totalsY);
                totalsY += 10; // Adjust position for next line
            });
            yPos += 70 ; // Reduce bottom margin
        }

        let pageCount = 1;
        doc.autoTable({
            head: head,
            body: body,
            startY: yPos, // Position the table just after the totals
            margin: { top: 5 },
            styles: {
                font: 'Calibri',
                fontSize: 12,
                lineColor: [0, 0, 0], // Couleur des bordures (noir)
                lineWidth: 0.2, // Épaisseur des bordures
            },
            headStyles: {
                fontSize: 12,
                fontStyle: 'bold',
                fillColor: [200, 200, 200], // Arrière-plan gris clair pour les en-têtes
                textColor: [0, 0, 0], // Texte noir pour les en-têtes
            },
            bodyStyles: {
                fillColor: [255, 255, 255], // Arrière-plan blanc pour le corps
                textColor: [0, 0, 0], // Texte noir pour le corps
            },
            didDrawPage: (data) => {
                const pageSize = doc.internal.pageSize;
                const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                doc.setFontSize(10);
                const pageInfo = `Page ${pageCount}`;
                const textWidth = doc.getTextWidth(pageInfo);
                doc.text(pageInfo, pageSize.width - textWidth - 10, pageHeight - 10);
                pageCount++;
            }
        });

        doc.save(`${fileName}.pdf`);
    }

    private formatDate(dateInfo: any): string {
        if(dateInfo){
            console.log(dateInfo)
            if (dateInfo.period) {
                return `du ${this.formatDate2(dateInfo.period.start)} au ${this.formatDate2(dateInfo.period.end)}`;
            } else if (dateInfo.day) {
                return `du ${this.formatDate2(dateInfo.day)}`;
            } else if (dateInfo.trimester) {
                return `du ${this.formatDate2(dateInfo.trimester.start)} au ${this.formatDate2(dateInfo.trimester.end)}`;
            }
        }
        return '';
    }

    formatDate2(date: Date): string {
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}
