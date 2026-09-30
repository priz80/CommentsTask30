// Объявляем константу filterByType — стрелочную функцию, которая принимает тип и произвольное количество значений,
// затем фильтрует массив значений, оставляя только те, чей тип совпадает с заданным
const filterByType = (type, ...values) => values.filter(value => typeof value === type),

	// Объявляем константу hideAllResponseBlocks — стрелочную функцию, которая скрывает все блоки ответов
	hideAllResponseBlocks = () => {
		// Преобразуем NodeList (результат querySelectorAll) в обычный массив всех элементов div с классом dialog__response-block
		const responseBlocksArray = Array.from(document.querySelectorAll('div.dialog__response-block'));
		// Для каждого блока в массиве устанавливаем CSS-свойство display: none, чтобы скрыть его
		responseBlocksArray.forEach(block => block.style.display = 'none');
	},

	// Объявляем константу showResponseBlock — стрелочную функцию, которая показывает один блок ответа и опционально обновляет текст внутри элемента
	showResponseBlock = (blockSelector, msgText, spanSelector) => {
		// Сначала скрываем все блоки ответов, вызывая ранее определённую функцию hideAllResponseBlocks
		hideAllResponseBlocks();
		// Находим первый DOM-элемент, соответствующий селектору blockSelector, и делаем его видимым (display: block)
		document.querySelector(blockSelector).style.display = 'block';
		// Если передан селектор spanSelector (не null и не undefined)...
		if (spanSelector) {
			// Находим элемент по селектору spanSelector и заменяем его текстовое содержимое на msgText
			document.querySelector(spanSelector).textContent = msgText;
		}
	},

	// Объявляем константу showError — стрелочную функцию, которая вызывает showResponseBlock для отображения блока ошибки
	// Передаёт селектор блока ошибки '.dialog__response-block_error', текст сообщения и селектор span '#error' для вывода текста
	showError = msgText => showResponseBlock('.dialog__response-block_error', msgText, '#error'),

	// Объявляем константу showResults — стрелочную функцию, которая вызывает showResponseBlock для отображения блока успешного результата
	// Передаёт селектор блока успеха '.dialog__response-block_ok', текст сообщения и селектор span '#ok' для вывода текста
	showResults = msgText => showResponseBlock('.dialog__response-block_ok', msgText, '#ok'),

	// Объявляем константу showNoResults — стрелочную функцию, которая вызывает showResponseBlock для отображения блока «нет результатов»
	// Передаёт селектор блока '.dialog__response-block_no-results' без текста и span, так как текст не требуется
	showNoResults = () => showResponseBlock('.dialog__response-block_no-results'),

	// Объявляем константу tryFilterByType — стрелочную функцию для безопасной фильтрации данных по типу
	tryFilterByType = (type, values) => {
		// Начинаем блок try/catch для перехвата возможных ошибок при выполнении eval
		try {
			// Разбиваем входную строку на отдельные элементы по запятой и удаляем пробелы
			const rawValues = values.split(',').map(v => v.trim());
			// Вычисляем каждый элемент через eval для определения его реального типа
			// (например, "true" -> boolean true, "123" -> number 123, '"hello"' -> string "hello")
			const parsedValues = rawValues.map(v => eval(v));
			// Вызываем filterByType с вычисленными значениями для фильтрации по типу
			const valuesArray = filterByType(type, ...parsedValues).join(", ");
			// Проверяем, не пустой ли полученный массив valuesArray;
			// Если есть данные — формируем сообщение с найденными значениями, иначе — сообщение об отсутствии данных
			const alertMsg = (valuesArray.length) ?
				`Данные с типом ${type}: ${valuesArray}` :
				`Отсутствуют данные типа ${type}`;
			// Вызываем showResults для отображения блока с сообщением alertMsg
			showResults(alertMsg);
		// Если eval или filterByType вызвали исключение...
		} catch (e) {
			// Вызываем showError для отображения блока с текстом ошибки (включая сообщение исключения)
			showError(`Ошибка: ${e}`);
		}
	};

// Находим первый DOM-элемент с id="filter-btn" и сохраняем ссылку на него в константу filterButton
const filterButton = document.querySelector('#filter-btn');

// Добавляем обработчик события 'click' на кнопку filterButton;
// при клике выполняется стрелочная функция с параметром event (e)
filterButton.addEventListener('click', e => {
	// Находим DOM-элемент с id="type" (поле ввода типа) и сохраняем ссылку в typeInput
	const typeInput = document.querySelector('#type');
	// Находим DOM-элемент с id="data" (поле ввода данных) и сохраняем ссылку в dataInput
	const dataInput = document.querySelector('#data');

	// Проверяем, пусто ли поле dataInput (строка пустая или содержит только пробелы после trim не проверяется здесь)
	if (dataInput.value === '') {
		// Устанавливаем пользовательское сообщение об ошибки валидации для поля dataInput: "Поле не должно быть пустым!"
		dataInput.setCustomValidity('Поле не должно быть пустым!');
		// Вызываем showNoResults для отображения блока «нет результатов»
		showNoResults();
	} else {
		// Сбрасываем пользовательское сообщение об ошибке валидации, передавая пустую строку
		dataInput.setCustomValidity('');
		// Отменяем стандартное поведение события (например, отправку формы), чтобы страница не перезагружалась
		e.preventDefault();
		// Вызываем tryFilterByType, передавая trimmed значение типа из typeInput и trimmed значение данных из dataInput
		tryFilterByType(typeInput.value.trim(), dataInput.value.trim());
	}
});
