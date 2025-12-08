// GigaChat prompt templates for InnoCivic platform

export interface DatasetContext {
  title?: string;
  description?: string;
  category?: string;
  format?: string;
  source?: string;
  geographicCoverage?: string;
  timePeriod?: { start?: string; end?: string };
  tags?: string[];
  qualityScore?: number;
  license?: string;
  uploadedBy?: string;
  downloadCount?: number;
  viewCount?: number;
  previewData?: any[];
}

export const createDatasetChatPrompt = (datasetContext: DatasetContext): string => {
  return `Вы - ИИ-помощник платформы InnoCivic для работы с данными. Вы помогаете пользователям анализировать датасеты, отвечать на вопросы о данных и предлагать идеи для анализа.

Информация о датасете:
- Название: ${datasetContext.title || 'Не указано'}
- Описание: ${datasetContext.description || 'Не указано'}
- Категория: ${datasetContext.category || 'Не указано'}
- Формат: ${datasetContext.format || 'Не указано'}
- Источник: ${datasetContext.source || 'Не указано'}
- Географическое покрытие: ${datasetContext.geographicCoverage || 'Не указано'}
- Временной период: ${datasetContext.timePeriod?.start || 'Не указано'} - ${datasetContext.timePeriod?.end || 'Не указано'}
- Теги: ${datasetContext.tags?.join(', ') || 'Не указаны'}
- Качество: ${datasetContext.qualityScore || 'Не указано'}/10
- Лицензия: ${datasetContext.license || 'Не указано'}
- Загружено: ${datasetContext.uploadedBy || 'Не указано'}
- Скачиваний: ${datasetContext.downloadCount || 0}
- Просмотров: ${datasetContext.viewCount || 0}

Отвечайте на русском языке. Будьте:
- Полезны и точны
- Объясняйте сложные концепции простыми словами
- Предлагайте конкретные идеи и рекомендации
- Честны относительно ограничений данных
- Дружелюбны и профессиональны

Если пользователь задает вопрос о датасете, используйте предоставленный контекст для ответа. Если вопрос не связан с датасетом, вежливо направьте разговор обратно к теме данных.`;
};

export const createDatasetSummaryPrompt = (datasetContext: DatasetContext): string => {
  return `Вы - ИИ-помощник платформы InnoCivic. Ваша задача - помогать пользователям понимать и анализировать наборы данных.

Создайте краткое, но информативное описание этого датасета на основе предоставленной информации. Описание должно быть на русском языке и включать:
- Что содержит датасет
- Его ключевые характеристики
- Потенциальную ценность для пользователей

Информация о датасете:
${JSON.stringify(datasetContext, null, 2)}

Будьте кратки, но полезны. Не добавляйте лишнюю информацию.`;
};

export const createDatasetInsightsPrompt = (datasetContext: DatasetContext): string => {
  return `Проанализируйте этот набор данных и предоставьте полезные insights на русском языке.

Информация о датасете:
- Название: ${datasetContext.title || 'Не указано'}
- Описание: ${datasetContext.description || 'Не указано'}
- Категория: ${datasetContext.category || 'Не указано'}
- Формат: ${datasetContext.format || 'Не указано'}
- Источник: ${datasetContext.source || 'Не указано'}
- Географическое покрытие: ${datasetContext.geographicCoverage || 'Не указано'}
- Временной период: ${datasetContext.timePeriod?.start || 'Не указано'} - ${datasetContext.timePeriod?.end || 'Не указано'}
- Теги: ${datasetContext.tags?.join(', ') || 'Не указаны'}
- Качество: ${datasetContext.qualityScore || 'Не указано'}/10

Превью данных (первые строки):
${datasetContext.previewData ? JSON.stringify(datasetContext.previewData.slice(0, 5), null, 2) : 'Превью данных недоступно'}

Пожалуйста, предоставьте:
1. Краткое описание того, что содержит этот датасет
2. Потенциальные сферы применения этих данных
3. Рекомендации по анализу
4. Возможные ограничения или предостережения
5. Предложения по визуализации

Ответьте на русском языке в структурированном формате.`;
};

export const createDatasetDescriptionPrompt = (datasetContext: DatasetContext): string => {
  return `Создайте подробное описание для этого набора данных на русском языке.

Информация о датасете:
- Название: ${datasetContext.title || 'Не указано'}
- Категория: ${datasetContext.category || 'Не указано'}
- Формат: ${datasetContext.format || 'Не указано'}
- Источник: ${datasetContext.source || 'Не указано'}
- Географическое покрытие: ${datasetContext.geographicCoverage || 'Не указано'}
- Временной период: ${datasetContext.timePeriod?.start || 'Не указано'} - ${datasetContext.timePeriod?.end || 'Не указано'}
- Теги: ${datasetContext.tags?.join(', ') || 'Не указаны'}

Структура данных (превью):
${datasetContext.previewData ? JSON.stringify(datasetContext.previewData.slice(0, 3), null, 2) : 'Структура данных недоступна'}

Создайте привлекательное и информативное описание, которое:
- Объясняет, что содержит датасет
- Указывает на ценность и полезность данных
- Описывает ключевые характеристики
- Упоминает потенциальные применения

Описание должно быть на русском языке и занимать 2-4 предложения.`;
};


export const createDataAnalysisPrompt = (datasetContext: DatasetContext, analysisType: string): string => {
  const basePrompt = `Проанализируйте датасет и предоставьте ${analysisType} на русском языке.

Датасет: ${datasetContext.title}
Описание: ${datasetContext.description}
Категория: ${datasetContext.category}
Формат: ${datasetContext.format}

Превью данных:
${datasetContext.previewData ? JSON.stringify(datasetContext.previewData.slice(0, 10), null, 2) : 'Нет превью данных'}

`;

  switch (analysisType) {
    case 'trends':
      return basePrompt + 'Определите основные тенденции и паттерны в данных. Какие выводы можно сделать?';

    case 'quality':
      return basePrompt + 'Оцените качество данных. Выявите потенциальные проблемы, пропущенные значения, аномалии.';

    case 'insights':
      return basePrompt + 'Предоставьте ключевые insights и интересные факты из этих данных.';

    case 'visualization':
      return basePrompt + 'Предложите наиболее подходящие типы визуализаций для этих данных и объясните почему.';

    default:
      return basePrompt + 'Предоставьте общий анализ данных.';
  }
};

