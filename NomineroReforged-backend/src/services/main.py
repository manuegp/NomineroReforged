import argparse
import json
import openpyxl
import os

# Crear el analizador de argumentos
parser = argparse.ArgumentParser(description="Rellenar una plantilla de Excel con datos de un JSON.")
parser.add_argument("-i", "--input", required=True, help="Ruta al archivo JSON de entrada. Si esta en la misma carpeta, solo el nombre")
parser.add_argument("-o", "--output", required=True, help="Nombre del archivo Excel resultante.")
args = parser.parse_args()

# Determinar rutas
input_path = args.input
excel_path = os.path.join(os.path.dirname(input_path), "plantilla.xlsx")
output_path = os.path.join(os.path.dirname(input_path), args.output)

# Cargar datos del archivo JSON
with open(input_path, "r", encoding="utf-8") as json_file:
    data = json.load(json_file)

# Cargar plantilla de Excel
workbook = openpyxl.load_workbook(excel_path)
sheet = workbook.active

# Escribir datos en la plantilla
start_row = 5
for idx, entry in enumerate(data):
    row = start_row + idx
    sheet[f"A{row}"] = entry.get("user", "")
    sheet[f"B{row}"] = entry.get("company", "")
    sheet[f"C{row}"] = entry.get("projectCode", "")
    sheet[f"D{row}"] = entry.get("id_phase", "")
    sheet[f"E{row}"] = entry.get("date", "")
    sheet[f"F{row}"] = entry.get("time", "")
    sheet[f"G{row}"] = entry.get("tasa", "")
    sheet[f"H{row}"] = entry.get("clasificacion_hora", "")
    sheet[f"I{row}"] = entry.get("coment", "")

# Guardar el archivo Excel resultante
workbook.save(output_path)

print(f"Archivo Excel generado exitosamente en: {output_path}")
