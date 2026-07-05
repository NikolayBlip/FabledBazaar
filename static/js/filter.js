// filter.js
export function filterCollection($shopGrid, $shopItems, collection, isFiltering, shopManager) {
    isFiltering = true;

    // Показываем блокер при старте фильтрации
    if (shopManager.updateBlockerState) {
        shopManager.updateBlockerState();
    }

    $shopItems.stop(true).each((index, item) => {
        const $item = $(item);
        setTimeout(() => {
            $item.toggle(!collection || $item.data('collection') === collection);
        }, index * 20);
    });

    // Завершение фильтрации
    setTimeout(() => {
        isFiltering = false;
        shopManager.isFiltering = false;

        // Обновляем состояние блокера
        if (shopManager.updateBlockerState) {
            shopManager.updateBlockerState();
        }
    }, $shopItems.length * 20 + 300);

    return isFiltering;
    
}