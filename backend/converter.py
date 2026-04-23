import sys
from docling.document_converter import DocumentConverter

def convert_to_md(input_path, output_path):
    try:
        # Inicializa o motor do Docling
        converter = DocumentConverter()
        
        # Faz a leitura do arquivo (PDF, DOCX, etc)
        result = converter.convert(input_path)
        
        # Converte o resultado para a formatação Markdown (.md)
        md_content = result.document.export_to_markdown()
        
        # Salva o novo arquivo .md
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(md_content)
            
        print("SUCESSO")
    except Exception as e:
        print(f"ERRO: {str(e)}")

# Pega os caminhos que o Node.js vai enviar pelo terminal
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("ERRO: Faltam argumentos (input_path e output_path)")
        sys.exit(1)
        
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    convert_to_md(input_file, output_file)