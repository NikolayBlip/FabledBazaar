import streamlit as st
import pandas as pd
from PIL import Image
import os
from datetime import datetime
import plotly.express as px
import plotly.graph_objects as go
from io import BytesIO

INVENTORY_FILE = 'inventory_data.xlsx'
DATA_FILE = 'data.xlsx'

st.set_page_config(
    page_title="PRIMAL SPIRIT CRM",
    page_icon="📊",
    layout="wide"
)

st.markdown("""
    <style>
    .stImage img {
        height: 180px !important;
        width: 100% !important;
        object-fit: contain !important;
        background-color: #fafafa;
    }
    [data-testid="stVerticalBlockBorderWrapper"] {
        padding: 10px !important;
    }
    [data-testid="column"] {
        padding: 2px !important;
    }
    .stRadio > div {
        gap: 10px;
    }
    .stSelectbox {
        margin-bottom: 10px;
    }
    
    .low-stock-card {
        border: 3px solid #ff4444 !important;
        border-radius: 10px !important;
        background-color: #fff5f5 !important;
    }
    
    .warning-stock-card {
        border: 3px solid #ffaa00 !important;
        border-radius: 10px !important;
        background-color: #fffbf0 !important;
    }
    
    .normal-stock-card {
        border: 1px solid #e0e0e0 !important;
        border-radius: 10px !important;
    }
    </style>
""", unsafe_allow_html=True)

@st.cache_data
def load_data():
    try:
        df = pd.read_excel(DATA_FILE, header=0, dtype={
            'название': str,
            'Артикул': str,
            'высота модели мм': str,
            'обьём модели мм3': str,
            'полимер мл': str,
            'полимер цена': str,
            'вес металла': str,
            'цена металла': str,
            'общая стоимость материалов и литья': str,
            'монтировка': str,
            'упаковка + конверт + сборка': str,
            'ИТОГО': str,
            'ЦЕНА (примерная по логике за грамм)': str,
            'Цена': float,
            'фото': str
        })
        
        df = df.dropna(how='all')
        df = df.dropna(subset=['Артикул'])
        df = df.reset_index(drop=True)
        df['Артикул'] = df['Артикул'].astype(str).str.strip()
        df['Цена'] = pd.to_numeric(df['Цена'], errors='coerce').fillna(0)
        
        return df
    
    except FileNotFoundError:
        st.error(f"Файл {DATA_FILE} не найден.")
        df = pd.DataFrame({
            'название': ['Мышь', 'Слон', 'Кошка'],
            'Артикул': ['16', '17', '18'],
            'высота модели мм': ['15', '25', '12'],
            'обьём модели мм3': ['525', '800', '450'],
            'полимер мл': ['1.525', '2.1', '1.3'],
            'полимер цена': ['25.925', '35.7', '22.1'],
            'вес металла': ['4.725', '6.2', '3.8'],
            'цена металла': ['28.35', '37.2', '22.8'],
            'общая стоимость материалов и литья': ['104.275', '145.2', '89.5'],
            'монтировка': ['120', '150', '100'],
            'упаковка + конверт + сборка': ['70', '80', '65'],
            'ИТОГО': ['294.275', '375.2', '254.5'],
            'ЦЕНА (примерная по логике за грамм)': ['1943', '2500', '1680'],
            'Цена': [3200.0, 4200.0, 2800.0],
            'фото': ['mouse.webp', 'elephant.webp', 'cat.webp']
        })
        return df

def load_inventory():
    if os.path.exists(INVENTORY_FILE):
        try:
            df = pd.read_excel(INVENTORY_FILE, dtype={'Артикул': str})
            inventory_dict = {}
            for _, row in df.iterrows():
                article = str(row['Артикул']).strip()
                inventory_dict[article] = {
                    'готовые': int(row['готовые']),
                    'заготовки': int(row['заготовки']),
                    'дата_изменения': str(row.get('дата_изменения', ''))
                }
            return inventory_dict
        except Exception as e:
            st.sidebar.error(f"Ошибка загрузки остатков: {e}")
            return {}
    return {}

def save_inventory():
    try:
        df = load_data()
        inventory_list = []
        
        for _, row in df.iterrows():
            article = str(row['Артикул']).strip()
            data = st.session_state.inventory_data.get(article, {
                'готовые': 0,
                'заготовки': 0,
                'дата_изменения': ''
            })
            
            inventory_list.append({
                'Артикул': article,
                'Название': str(row['название']),
                'готовые': int(data['готовые']),
                'заготовки': int(data['заготовки']),
                'Всего': int(data['готовые']) + int(data['заготовки']),
                'Цена': float(row['Цена']),
                'Стоимость готовых': int(data['готовые']) * float(row['Цена']),
                'Общая стоимость': (int(data['готовые']) + int(data['заготовки'])) * float(row['Цена']),
                'дата_изменения': data.get('дата_изменения', datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            })
        
        inventory_df = pd.DataFrame(inventory_list)
        
        with pd.ExcelWriter(INVENTORY_FILE, engine='openpyxl') as writer:
            inventory_df.to_excel(writer, sheet_name='Остатки', index=False)
        
        return True
    except Exception as e:
        st.sidebar.error(f"Ошибка сохранения: {e}")
        return False

def load_image(image_name, size=(300, 200)):
    img_path = os.path.join('img', str(image_name))
    if os.path.exists(img_path):
        try:
            img = Image.open(img_path).convert('RGBA')
            img.thumbnail(size, Image.Resampling.LANCZOS)
            background = Image.new('RGBA', size, (255, 255, 255, 255))
            x = (size[0] - img.size[0]) // 2
            y = (size[1] - img.size[1]) // 2
            background.paste(img, (x, y), img)
            return background
        except Exception:
            return Image.new('RGBA', size, (200, 200, 200, 255))
    else:
        return Image.new('RGBA', size, (200, 200, 200, 255))

def init_inventory():
    df = load_data()
    for _, row in df.iterrows():
        article = str(row['Артикул']).strip()
        if article not in st.session_state.inventory_data:
            st.session_state.inventory_data[article] = {
                'готовые': 0,
                'заготовки': 0,
                'дата_изменения': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }

def get_stock_status(total):
    if total == 0:
        return 'low'
    elif total == 1:
        return 'warning'
    else:
        return 'normal'

if 'inventory_data' not in st.session_state:
    loaded_data = load_inventory()
    st.session_state.inventory_data = loaded_data if loaded_data else {}

if 'page' not in st.session_state:
    st.session_state.page = 'main'

init_inventory()

def main_page():
    st.title("📊 Система учета товаров")
    
    df = load_data()
    
    with st.sidebar:
        st.header("🔍 Фильтры и сортировка")
        
        search = st.text_input("🔍 Поиск по названию или артикулу", placeholder="Введите текст...")
        
        st.divider()
        
        st.subheader("📋 Сортировка")
        sort_field = st.selectbox(
            "Сортировать по:",
            ["Без сортировки", "Название", "Артикул", "Цена"],
            key="sort_field_main"
        )
        sort_order = st.radio(
            "Порядок:",
            ["⬆️ По возрастанию", "⬇️ По убыванию"],
            horizontal=True,
            key="sort_order_main"
        )
        
        st.divider()
        
        st.subheader("💰 Фильтр по цене")
        prices = pd.to_numeric(df['Цена'], errors='coerce').dropna()
        if len(prices) > 0:
            min_price = int(prices.min())
            max_price = int(prices.max())
        else:
            min_price, max_price = 0, 10000
            
        price_range = st.slider(
            "Диапазон цен",
            min_price, max_price,
            (min_price, max_price),
            key="price_range_main"
        )
        
        st.divider()
        
        st.subheader("💾 Управление данными")
        
        col_btn1, col_btn2 = st.columns(2)
        with col_btn1:
            if st.button("💾 Сохранить", width='stretch'):
                if save_inventory():
                    st.success("✅ Сохранено!")
                    st.rerun()
        
        with col_btn2:
            if st.button("🔄 Сбросить", width='stretch'):
                if os.path.exists(INVENTORY_FILE):
                    os.remove(INVENTORY_FILE)
                st.session_state.inventory_data = {}
                st.rerun()
        
        if os.path.exists(INVENTORY_FILE):
            file_time = datetime.fromtimestamp(os.path.getmtime(INVENTORY_FILE))
            st.caption(f"💾 Сохранено: {file_time.strftime('%d.%m.%Y %H:%M')}")
    
    filtered_df = df.copy()
    
    if search:
        filtered_df = filtered_df[
            filtered_df['название'].str.contains(search, case=False, na=False) |
            filtered_df['Артикул'].astype(str).str.contains(search, na=False)
        ]
    
    filtered_df['Цена_num'] = pd.to_numeric(filtered_df['Цена'], errors='coerce').fillna(0)
    filtered_df = filtered_df[
        (filtered_df['Цена_num'] >= price_range[0]) & 
        (filtered_df['Цена_num'] <= price_range[1])
    ]
    
    if sort_field != "Без сортировки":
        ascending = sort_order == "⬆️ По возрастанию"
        if sort_field == "Название":
            filtered_df = filtered_df.sort_values('название', ascending=ascending)
        elif sort_field == "Артикул":
            filtered_df['Артикул_sort'] = pd.to_numeric(filtered_df['Артикул'], errors='coerce').fillna(0)
            filtered_df = filtered_df.sort_values('Артикул_sort', ascending=ascending)
        elif sort_field == "Цена":
            filtered_df = filtered_df.sort_values('Цена_num', ascending=ascending)
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Всего товаров", len(df))
    with col2:
        st.metric("Отфильтровано", len(filtered_df))
    with col3:
        total_ready = sum(int(data.get('готовые', 0)) for data in st.session_state.inventory_data.values())
        st.metric("Готовые изделия", total_ready)
    with col4:
        total_blanks = sum(int(data.get('заготовки', 0)) for data in st.session_state.inventory_data.values())
        st.metric("Заготовки", total_blanks)
    
    st.markdown("""
    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        <span>🔴 <b>Красный</b> - 0 остатков</span>
        <span>🟡 <b>Желтый</b> - 1 остаток</span>
        <span>⚪ <b>Обычный</b> - 2+ остатков</span>
    </div>
    """, unsafe_allow_html=True)
    
    st.subheader("📋 Каталог товаров")
    
    if sort_field != "Без сортировки":
        sort_direction = "возрастанию" if sort_order == "⬆️ По возрастанию" else "убыванию"
        st.caption(f"Сортировка: по {sort_field.lower()} ({sort_direction})")
    
    if len(filtered_df) == 0:
        st.warning("Товары не найдены. Измените параметры фильтрации.")
        return
    
    cols = st.columns(5)
    
    for idx, (_, row) in enumerate(filtered_df.iterrows()):
        article = str(row['Артикул']).strip()
        unique_id = f"{article}_{idx}"
        
        if article not in st.session_state.inventory_data:
            st.session_state.inventory_data[article] = {
                'готовые': 0,
                'заготовки': 0,
                'дата_изменения': ''
            }
        
        ready = int(st.session_state.inventory_data[article]['готовые'])
        blanks = int(st.session_state.inventory_data[article]['заготовки'])
        total = ready + blanks
        
        stock_status = get_stock_status(total)
        
        with cols[idx % 5]:
            if stock_status == 'low':
                st.markdown('<div class="low-stock-card">', unsafe_allow_html=True)
            elif stock_status == 'warning':
                st.markdown('<div class="warning-stock-card">', unsafe_allow_html=True)
            else:
                st.markdown('<div class="normal-stock-card">', unsafe_allow_html=True)
            
            with st.container():
                st.markdown(f"**Артикул: {article}**")
                st.markdown(f"*{row['название']}*")
                st.markdown(f"💰 **{float(row['Цена']):.0f} ₽**")
                
                img = load_image(row['фото'])
                st.image(img, width='stretch')
                
                col1, col2 = st.columns(2)
                with col1:
                    new_ready = st.number_input(
                        "Готовые",
                        min_value=0,
                        value=ready,
                        key=f"ready_{unique_id}"
                    )
                with col2:
                    new_blanks = st.number_input(
                        "Заготовки",
                        min_value=0,
                        value=blanks,
                        key=f"blanks_{unique_id}"
                    )
                
                total = new_ready + new_blanks
                
                if total == 0:
                    st.error(f"⚠️ Нет в наличии")
                elif total == 1:
                    st.warning(f"⚡ В наличии: {total} шт.")
                else:
                    st.info(f"📦 В наличии: {total} шт.")
                
                if new_ready != ready or new_blanks != blanks:
                    st.session_state.inventory_data[article] = {
                        'готовые': new_ready,
                        'заготовки': new_blanks,
                        'дата_изменения': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                    save_inventory()
                    st.rerun()
                
                last_update = st.session_state.inventory_data[article].get('дата_изменения', '')
                if last_update:
                    st.caption(f"Изменено: {last_update}")
                
                if st.button("📋 Подробнее", key=f"details_{unique_id}", width='stretch'):
                    st.session_state.selected_product = article
                    st.session_state.page = 'details'
                    st.rerun()
            
            st.markdown('</div>', unsafe_allow_html=True)
            st.markdown("<br>", unsafe_allow_html=True)

def details_page():
    st.title("📋 Детальная информация о товаре")
    
    if 'selected_product' not in st.session_state:
        st.warning("Товар не выбран")
        if st.button("Вернуться к каталогу"):
            st.session_state.page = 'main'
            st.rerun()
        return
    
    article = st.session_state.selected_product
    df = load_data()
    df['Артикул'] = df['Артикул'].astype(str).str.strip()
    
    if article not in df['Артикул'].values:
        st.error(f"Товар с артикулом {article} не найден")
        return
    
    product = df[df['Артикул'] == article].iloc[0]
    
    if st.button("◀ Назад к каталогу"):
        st.session_state.page = 'main'
        st.rerun()
    
    st.markdown("---")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        img = load_image(product['фото'], size=(400, 400))
        st.image(img, width='stretch')
        
        st.subheader("📦 Наличие")
        article_data = st.session_state.inventory_data.get(article, {
            'готовые': 0,
            'заготовки': 0
        })
        
        total = article_data['готовые'] + article_data['заготовки']
        
        col_r, col_b = st.columns(2)
        with col_r:
            st.metric("Готовые", article_data['готовые'])
        with col_b:
            st.metric("Заготовки", article_data['заготовки'])
        
        if total == 0:
            st.error("⚠️ Нет в наличии!")
        elif total == 1:
            st.warning("⚡ Последний экземпляр!")
        
        if article_data.get('дата_изменения'):
            st.caption(f"Последнее изменение: {article_data['дата_изменения']}")
    
    with col2:
        st.subheader(f"Товар: {product['название']}")
        st.write(f"**Артикул:** {article}")
        st.write(f"**Цена продажи:** {float(product['Цена']):.0f} ₽")
        
        st.markdown("---")
        
        characteristics = {
            'Параметр': [
                'Высота модели (мм)', 'Объём модели (мм³)',
                'Полимер (мл)', 'Цена полимера',
                'Вес металла', 'Цена металла',
                'Общая стоимость материалов и литья',
                'Монтировка', 'Упаковка + конверт + сборка',
                'ИТОГО себестоимость', 'Цена за грамм (примерная)'
            ],
            'Значение': [
                product['высота модели мм'], product['обьём модели мм3'],
                product['полимер мл'], f"{product['полимер цена']} ₽",
                product['вес металла'], f"{product['цена металла']} ₽",
                f"{product['общая стоимость материалов и литья']} ₽",
                f"{product['монтировка']} ₽",
                f"{product['упаковка + конверт + сборка']} ₽",
                f"{product['ИТОГО']} ₽",
                f"{product['ЦЕНА (примерная по логике за грамм)']} ₽"
            ]
        }
        
        char_df = pd.DataFrame(characteristics)
        st.table(char_df.set_index('Параметр'))
        
        st.markdown("---")
        st.subheader("💰 Финансовый анализ")
        
        try:
            cost_price = float(product['ИТОГО'])
            selling_price = float(product['Цена'])
            profit = selling_price - cost_price
            margin = (profit / selling_price) * 100 if selling_price > 0 else 0
            
            col_p1, col_p2, col_p3 = st.columns(3)
            with col_p1:
                st.metric("Себестоимость", f"{cost_price:.2f} ₽")
            with col_p2:
                st.metric("Прибыль с единицы", f"{profit:.2f} ₽")
            with col_p3:
                st.metric("Маржинальность", f"{margin:.1f}%")
        except:
            st.warning("Не удалось рассчитать финансовые показатели")

def reports_page():
    st.title("📊 Отчеты и аналитика")
    
    df = load_data()
    df['Артикул'] = df['Артикул'].astype(str).str.strip()
    df['Цена'] = pd.to_numeric(df['Цена'], errors='coerce').fillna(0)
    df['Себестоимость'] = pd.to_numeric(df['общая стоимость материалов и литья'], errors='coerce').fillna(0)
    
    st.subheader("📈 Общая статистика")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Всего SKU", len(df))
    with col2:
        total_value = 0.0
        for _, row in df.iterrows():
            art = str(row['Артикул']).strip()
            data = st.session_state.inventory_data.get(art, {'готовые': 0, 'заготовки': 0})
            price = float(row['Цена'])
            total_value += (int(data.get('готовые', 0)) + int(data.get('заготовки', 0))) * price
        st.metric("Общая стоимость запасов", f"{total_value:,.0f} ₽")
    with col3:
        avg_price = df['Цена'].mean()
        st.metric("Средняя цена", f"{avg_price:,.0f} ₽")
    with col4:
        total_items = sum(
            int(data.get('готовые', 0)) + int(data.get('заготовки', 0))
            for data in st.session_state.inventory_data.values()
        )
        st.metric("Всего единиц", total_items)
    
    st.subheader("📦 Текущие запасы")
    
    inventory_report = []
    for _, row in df.iterrows():
        article = str(row['Артикул']).strip()
        data = st.session_state.inventory_data.get(article, {
            'готовые': 0,
            'заготовки': 0,
            'дата_изменения': ''
        })
        ready = int(data['готовые'])
        blanks = int(data['заготовки'])
        price = float(row['Цена'])
        cost = float(row['Себестоимость'])
        
        inventory_report.append({
            'Артикул': article,
            'Название': row['название'],
            'Готовые': ready,
            'Заготовки': blanks,
            'Всего': ready + blanks,
            'Цена': price,
            'Себестоимость': cost,
            'Стоимость готовых': ready * price,
            'Общая стоимость': (ready + blanks) * price,
            'Последнее изменение': data.get('дата_изменения', 'Нет данных')
        })
    
    report_df = pd.DataFrame(inventory_report)
    
    st.dataframe(
        report_df,
        width='stretch',
        column_config={
            'Цена': st.column_config.NumberColumn('Цена', format='%.0f ₽'),
            'Себестоимость': st.column_config.NumberColumn('Себестоимость', format='%.0f ₽'),
            'Стоимость готовых': st.column_config.NumberColumn('Стоимость готовых', format='%.0f ₽'),
            'Общая стоимость': st.column_config.NumberColumn('Общая стоимость', format='%.0f ₽'),
        },
        hide_index=True
    )
    
    st.subheader("📊 График запасов по артикулам")
    
    show_empty = st.checkbox("Показать товары с нулевыми остатками", value=False, key="show_empty_graph")
    
    plot_df = report_df.copy()
    if not show_empty:
        plot_df = plot_df[plot_df['Всего'] > 0]
    
    if len(plot_df) > 0:
        plot_df = plot_df.sort_values('Всего', ascending=True)
        plot_df['label'] = plot_df['Название'] + ' (Арт: ' + plot_df['Артикул'] + ')'
        
        fig = go.Figure()
        
        fig.add_trace(go.Bar(
            name='Готовые',
            y=plot_df['label'],
            x=plot_df['Готовые'],
            orientation='h',
            marker_color='#2ecc71',
            text=plot_df['Готовые'],
            textposition='auto',
            hovertemplate='%{y}<br>Готовые: %{x}<extra></extra>'
        ))
        
        fig.add_trace(go.Bar(
            name='Заготовки',
            y=plot_df['label'],
            x=plot_df['Заготовки'],
            orientation='h',
            marker_color='#3498db',
            text=plot_df['Заготовки'],
            textposition='auto',
            hovertemplate='%{y}<br>Заготовки: %{x}<extra></extra>'
        ))
        
        fig.update_layout(
            title='Количество товаров по артикулам',
            xaxis_title='Количество',
            yaxis_title='',
            barmode='group',
            bargap=0.15,
            height=max(400, len(plot_df) * 30),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            margin=dict(l=20, r=20, t=50, b=20),
            yaxis=dict(tickfont=dict(size=10))
        )
        
        fig.update_xaxes(dtick=1)
        
        st.plotly_chart(fig, width='stretch')
        
        st.subheader("📊 Общее количество по артикулам (горизонтальный)")
        
        fig2 = go.Figure()
        
        fig2.add_trace(go.Bar(
            y=plot_df['label'],
            x=plot_df['Всего'],
            orientation='h',
            marker=dict(
                color=plot_df['Всего'],
                colorscale='Viridis',
                showscale=True,
                colorbar=dict(title="Количество")
            ),
            text=plot_df['Всего'],
            textposition='auto',
            hovertemplate='%{y}<br>Всего: %{x}<extra></extra>'
        ))
        
        fig2.update_layout(
            title='Общее количество товаров',
            xaxis_title='Количество',
            yaxis_title='',
            height=max(400, len(plot_df) * 30),
            showlegend=False,
            margin=dict(l=20, r=20, t=50, b=20),
            yaxis=dict(tickfont=dict(size=10))
        )
        
        fig2.update_xaxes(dtick=1)
        
        st.plotly_chart(fig2, width='stretch')
    else:
        st.info("Нет данных для отображения графика. Добавьте товары в остатки.")
    
    st.markdown("---")
    st.subheader("🏭 Формирование заказа на литье")
    
    st.markdown("""
    <div style="background-color: #f0f8ff; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
        <b>📋 Заказ формируется для товаров, у которых:</b><br>
        • Общее количество (готовые + заготовки) = <b>0 или 1</b><br>
        • В заказ включаются все такие позиции<br>
        • Стоимость рассчитывается по <b>себестоимости материалов и литья</b>
    </div>
    """, unsafe_allow_html=True)
    
    order_items = []
    for _, row in report_df.iterrows():
        if row['Всего'] <= 1:
            order_items.append({
                'Название': row['Название'],
                'Артикул': row['Артикул'],
                'Текущее количество': row['Всего'],
                'Рекомендуемое количество': 2 - row['Всего'],
                'Себестоимость единицы': row['Себестоимость'],
                'Общая себестоимость': (2 - row['Всего']) * row['Себестоимость']
            })
    
    if order_items:
        order_df = pd.DataFrame(order_items)
        
        st.info(f"🔍 Найдено {len(order_df)} позиций для заказа")
        
        st.dataframe(
            order_df,
            width='stretch',
            column_config={
                'Себестоимость единицы': st.column_config.NumberColumn('Себестоимость ед.', format='%.0f ₽'),
                'Общая себестоимость': st.column_config.NumberColumn('Общая себестоимость', format='%.0f ₽'),
                'Текущее количество': st.column_config.NumberColumn('Текущее кол-во', format='%d шт.'),
                'Рекомендуемое количество': st.column_config.NumberColumn('Рекомендуемое кол-во', format='%d шт.'),
            },
            hide_index=True
        )
        
        col_order1, col_order2 = st.columns(2)
        
        with col_order1:
            output_order = BytesIO()
            with pd.ExcelWriter(output_order, engine='openpyxl') as writer:
                order_df.to_excel(writer, sheet_name='Заказ на литье', index=False)
                
                order_print = order_df[['Название', 'Артикул', 'Рекомендуемое количество', 'Общая себестоимость']].copy()
                order_print['Для заказа'] = order_print.apply(
                    lambda x: f"{x['Название']} (арт. {x['Артикул']}) - {x['Рекомендуемое количество']} шт.", axis=1
                )
                order_print.to_excel(writer, sheet_name='Для цеха', index=False)
            
            st.download_button(
                label="📥 Скачать заказ (Excel)",
                data=output_order.getvalue(),
                file_name=f"Заказ_на_литье_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                width='stretch'
            )
        
        with col_order2:
            text_order = "ЗАКАЗ НА ЛИТЬЕ\n" + "="*50 + "\n"
            text_order += f"Дата: {datetime.now().strftime('%d.%m.%Y')}\n"
            text_order += f"Количество позиций: {len(order_df)}\n"
            text_order += "="*50 + "\n\n"
            
            for _, item in order_df.iterrows():
                text_order += f"• {item['Название']} (арт. {item['Артикул']}) - {item['Рекомендуемое количество']} шт. | Себестоимость: {item['Общая себестоимость']:.0f} ₽\n"
            
            text_order += "\n" + "="*50 + "\n"
            text_order += f"ИТОГО себестоимость заказа: {order_df['Общая себестоимость'].sum():.0f} ₽\n"
            text_order += "Примечание: заказ сформирован автоматически\n"
            
            st.download_button(
                label="📄 Скачать список (TXT)",
                data=text_order,
                file_name=f"Заказ_на_литье_{datetime.now().strftime('%Y%m%d_%H%M')}.txt",
                mime="text/plain",
                width='stretch'
            )
        
        st.subheader("📊 Визуализация заказа")
        
        if len(order_df) > 0:
            fig_order = go.Figure()
            
            fig_order.add_trace(go.Bar(
                y=[f"{row['Название']} (арт. {row['Артикул']})" for _, row in order_df.iterrows()],
                x=order_df['Рекомендуемое количество'],
                orientation='h',
                marker_color='#e74c3c',
                text=order_df['Рекомендуемое количество'],
                textposition='auto',
                hovertemplate='%{y}<br>Заказать: %{x} шт.<br>Себестоимость: %{customdata:.0f} ₽',
                customdata=order_df['Общая себестоимость']
            ))
            
            fig_order.update_layout(
                title='Рекомендуемое количество для заказа',
                xaxis_title='Количество',
                yaxis_title='',
                height=max(300, len(order_df) * 40),
                showlegend=False,
                margin=dict(l=20, r=20, t=50, b=20)
            )
            
            fig_order.update_xaxes(dtick=1)
            
            st.plotly_chart(fig_order, width='stretch')
            
            st.subheader("💰 Стоимость заказа по позициям")
            
            fig_cost = go.Figure()
            
            fig_cost.add_trace(go.Bar(
                y=[f"{row['Название']} (арт. {row['Артикул']})" for _, row in order_df.iterrows()],
                x=order_df['Общая себестоимость'],
                orientation='h',
                marker_color='#e67e22',
                text=[f"{x:,.0f} ₽" for x in order_df['Общая себестоимость']],
                textposition='auto',
                hovertemplate='%{y}<br>Себестоимость: %{x:,.0f} ₽<extra></extra>'
            ))
            
            fig_cost.update_layout(
                title='Себестоимость заказа по позициям',
                xaxis_title='Стоимость (₽)',
                yaxis_title='',
                height=max(300, len(order_df) * 40),
                showlegend=False,
                margin=dict(l=20, r=20, t=50, b=20)
            )
            
            st.plotly_chart(fig_cost, width='stretch')
            
            st.markdown("---")
            st.subheader("📝 Сводка заказа")
            
            total_to_order = order_df['Рекомендуемое количество'].sum()
            total_cost = order_df['Общая себестоимость'].sum()
            avg_cost_per_item = total_cost / total_to_order if total_to_order > 0 else 0
            
            col_s1, col_s2, col_s3, col_s4 = st.columns(4)
            with col_s1:
                st.metric("Позиций в заказе", len(order_df))
            with col_s2:
                st.metric("Всего единиц", total_to_order)
            with col_s3:
                st.metric("Общая себестоимость", f"{total_cost:,.0f} ₽")
            with col_s4:
                st.metric("Средняя себест. ед.", f"{avg_cost_per_item:,.0f} ₽")
    else:
        st.success("✅ Все товары в достаточном количестве! Заказ не требуется.")
    
    st.markdown("---")
    st.subheader("📥 Экспорт данных")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("💾 Сохранить остатки", width='stretch'):
            if save_inventory():
                st.success("✅ Остатки сохранены!")
    
    with col2:
        csv = report_df.to_csv(index=False)
        st.download_button(
            label="📥 Скачать CSV",
            data=csv,
            file_name=f"inventory_{datetime.now().strftime('%Y%m%d_%H%M')}.csv",
            mime="text/csv",
            width='stretch'
        )
    
    with col3:
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            report_df.to_excel(writer, sheet_name='Остатки', index=False)
        
        st.download_button(
            label="📥 Скачать Excel",
            data=output.getvalue(),
            file_name=f"inventory_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            width='stretch'
        )

st.sidebar.title("🧭 Навигация")

if st.sidebar.button("📋 Каталог товаров", width='stretch',
                     type="primary" if st.session_state.page == 'main' else "secondary"):
    st.session_state.page = 'main'
    st.rerun()

if st.sidebar.button("📊 Отчеты и графики", width='stretch',
                     type="primary" if st.session_state.page == 'reports' else "secondary"):
    st.session_state.page = 'reports'
    st.rerun()

st.sidebar.markdown("---")

if os.path.exists(INVENTORY_FILE):
    file_time = datetime.fromtimestamp(os.path.getmtime(INVENTORY_FILE))
    st.sidebar.success(f"💾 Данные сохранены\n{file_time.strftime('%d.%m.%Y %H:%M')}")
else:
    st.sidebar.warning("⚠️ Данные не сохранены")

st.sidebar.info("""
**CRM система учета товаров**

- 📋 Просмотр каталога
- 🔍 Фильтрация и сортировка
- 📦 Учет остатков
- 📊 Графики и отчеты
- 💾 Автосохранение
""")

if st.session_state.page == 'main':
    main_page()
elif st.session_state.page == 'details':
    details_page()
elif st.session_state.page == 'reports':
    reports_page()