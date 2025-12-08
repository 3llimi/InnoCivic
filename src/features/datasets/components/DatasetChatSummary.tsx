import React, { useState, useRef, useEffect } from 'react';
import { Dataset, ChatMessage } from '../../../types';
import { sendAIChatMessage } from '../../../services/api';
import { createDatasetChatPrompt, createDatasetSummaryPrompt } from '../../../services/prompts';

interface DatasetChatSummaryProps {
  dataset: Dataset;
  className?: string;
}

export const DatasetChatSummary: React.FC<DatasetChatSummaryProps> = ({
  dataset,
  className = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate initial summary when component mounts
  useEffect(() => {
    const generateInitialSummary = async () => {
      if (messages.length === 0) {
        setIsLoading(true);
        try {
          const datasetContext = {
            title: dataset.title,
            description: dataset.description,
            category: dataset.category?.name,
            format: dataset.format,
            source: dataset.source,
            geographicCoverage: dataset.geographicCoverage,
            timePeriod: dataset.timePeriod,
            tags: dataset.tags,
            qualityScore: dataset.qualityScore,
            license: dataset.license,
            uploadedBy: dataset.uploadedBy?.fullName,
            downloadCount: dataset.downloadCount,
            viewCount: dataset.viewCount,
            previewData: dataset.previewData,
          };

          const systemPrompt = createDatasetSummaryPrompt(datasetContext);

          const response = await sendAIChatMessage({
            messages: [{
              role: 'user',
              content: 'Создай краткое описание этого датасета для пользователя'
            }],
            dataset_context: datasetContext,
            system_prompt: systemPrompt,
          });

          if (response?.success) {
            setMessages([{
              role: 'assistant',
              content: response.response,
              timestamp: new Date().toISOString(),
            }]);
          }
        } catch (error) {
          console.error('Failed to generate initial summary:', error);
          // Fallback to static summary
          const fallbackMessage: ChatMessage = {
            role: 'assistant',
            content: `Этот датасет называется "${dataset.title}". ${dataset.description || 'Подробное описание недоступно.'} Он относится к категории "${dataset.category?.name || 'Не указана'}" и содержит данные в формате ${dataset.format || 'Не указан'}.`,
            timestamp: new Date().toISOString(),
          };
          setMessages([fallbackMessage]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    generateInitialSummary();
  }, [dataset, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const datasetContext = {
        title: dataset.title,
        description: dataset.description,
        category: dataset.category?.name,
        format: dataset.format,
        source: dataset.source,
        geographicCoverage: dataset.geographicCoverage,
        timePeriod: dataset.timePeriod,
        tags: dataset.tags,
        qualityScore: dataset.qualityScore,
        license: dataset.license,
        uploadedBy: dataset.uploadedBy?.fullName,
        downloadCount: dataset.downloadCount,
        viewCount: dataset.viewCount,
        previewData: dataset.previewData,
      };

      const systemPrompt = createDatasetChatPrompt(datasetContext);

      const response = await sendAIChatMessage({
        messages: newMessages,
        dataset_context: datasetContext,
        system_prompt: systemPrompt,
      });

      if (response?.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
        };
        setMessages([...newMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.',
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 h-full ${className}`}
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            AI Ассистент Датасета
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Задавайте вопросы об этом датасете
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className={`h-4 w-4 transform transition-transform ${isMinimized ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-96">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start space-x-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                      AI
                    </div>
                  </div>
                )}
                <div className={`max-w-full ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`inline-block rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
                  }`}>
                    {message.content}
                  </div>
                  {message.timestamp && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold">
                      Вы
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                    AI
                  </div>
                </div>
                <div className="max-w-full">
                  <div className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-none px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Думаю...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Задайте вопрос о датасете..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 pr-10 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="absolute inset-y-0 right-1 flex items-center pr-2 disabled:opacity-50"
              >
                <svg
                  className={`h-5 w-5 transform transition-transform ${
                    inputValue.trim() && !isLoading ? 'text-blue-600 hover:scale-110' : 'text-gray-400'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 5L19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
