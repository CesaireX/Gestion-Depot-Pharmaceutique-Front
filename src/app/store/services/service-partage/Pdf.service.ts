import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Injectable({
    providedIn: 'root'
})
export class PdfService {
    constructor() { }

    exportPDF(data: any[], headers: string[], title: string, fileName: string,dateInfo: any, totals?: any) {
        const orientation = fileName === 'inventaire' ? 'l' : 'p'; // 'l' pour paysage, 'p' pour portrait

        const doc = new jsPDF(orientation, 'mm', 'a4'); // Initialiser avec l'orientation dynamique

        const formattedDate = this.formatDate(dateInfo);

        const head = [headers];
        const body = data.map(item => headers.map(header => item[header]));

        let yPos = 30; // Position initiale en dessous du titre

        // Ajouter les totaux sous le titre, si présents
        if (totals) {
            doc.setFontSize(12);
            for (const [key, value] of Object.entries(totals)) {
                doc.setFont('Calibri', 'bold'); // Set the font to bold
                doc.text(`${key}: ${value} FCFA`, 10, yPos);

                // Underline the text
                const textWidth = doc.getTextWidth(`${key}: ${value} FCFA`);
                doc.line(10, yPos + 1, 10 + textWidth, yPos + 1); // Adjust the yPos + 1 as needed

                yPos += 10;
            }
            yPos; // Ajouter un espace supplémentaire après les totaux
        }


        // Centrer et souligner le titre sur la première page
        let isFirstPage = true;
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

        drawHeader(doc); // Dessiner le titre sur la première page

        let pageCount = 1;
        doc.autoTable({
            head: head,
            body: body,
            startY: yPos, // Positionner le tableau juste après les totaux
            margin: { top: 5 },
            //styles: { fontSize: 12 },
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
            },// Taille de police pour les lignes du tableau
            didDrawPage: (data) => {
                // Ajouter le numéro de page en bas
                const pageSize = doc.internal.pageSize;
                const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                doc.setFontSize(10);
                const pageInfo = `Page ${pageCount}`;
                const textWidth = doc.getTextWidth(pageInfo);
                doc.text(pageInfo, pageSize.width - textWidth - 5, pageHeight - 5);
                pageCount++;

                if (!isFirstPage) {
                    return; // Ne pas répéter le titre et la ligne
                }
                isFirstPage = false; // Après la première page, mettre à jour l'état
            }
        });

        doc.save(`${fileName}.pdf`);
    }
    private formatDate(dateInfo: any): string {
        if(dateInfo){
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
