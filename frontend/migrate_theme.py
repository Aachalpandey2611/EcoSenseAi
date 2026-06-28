import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Backgrounds
    content = re.sub(r'bg-slate-950', 'bg-[var(--background)]', content)
    content = re.sub(r'bg-slate-900', 'bg-[var(--card)]', content)
    content = re.sub(r'bg-slate-800', 'bg-[var(--card)]', content)
    content = re.sub(r'bg-slate-700', 'bg-[var(--border)]', content)
    
    # Text colors
    content = re.sub(r'text-slate-400', 'text-[var(--muted-foreground)]', content)
    content = re.sub(r'text-slate-300', 'text-[var(--foreground)]', content)
    content = re.sub(r'text-slate-200', 'text-[var(--foreground)]', content)
    content = re.sub(r'text-slate-100', 'text-[var(--foreground)]', content)
    content = re.sub(r'text-slate-50', 'text-[var(--foreground)]', content)
    
    # We leave `text-white` alone usually, except where it was used as primary text
    # But for a light theme, text-white on a white card is invisible!
    # Let's replace text-white with text-[var(--foreground)] EXCEPT inside buttons or specific active states.
    # Actually, a safer bet is to replace text-white with text-[var(--foreground)] generally, 
    # and if there are specific cases where it needs to be white (like on dark headers), they can be fixed manually.
    content = re.sub(r'text-white', 'text-[var(--foreground)]', content)
    
    # Borders
    content = re.sub(r'border-slate-800', 'border-[var(--border)]', content)
    content = re.sub(r'border-slate-700', 'border-[var(--border)]', content)
    content = re.sub(r'border-slate-600', 'border-[var(--border)]', content)

    # Brands (except Button.tsx which we already did)
    if not filepath.endswith('Button.tsx') and not filepath.endswith('index.css'):
        content = re.sub(r'bg-brand-500', 'bg-[var(--primary)]', content)
        content = re.sub(r'text-brand-500', 'text-[var(--primary)]', content)
        content = re.sub(r'text-brand-400', 'text-[var(--primary)]', content)
        content = re.sub(r'border-brand-500', 'border-[var(--primary)]', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

def main():
    src_dir = r"c:\Users\amanp\OneDrive\Desktop\eco\frontend\src"
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
