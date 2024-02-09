import * as Dialog from '@radix-ui/react-dialog'
import { X } from "lucide-react"
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from "sonner"

interface newNoteCardProps {
    oneNoteCreate: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ oneNoteCreate }: newNoteCardProps) {
    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
    const [content, setContent] = useState("")
    const [isRecording, setIsRecording] = useState(false)

    function handleStartEditor() {
        setShouldShowOnboarding(false)
    }

    function handleContentChange(e: ChangeEvent<HTMLTextAreaElement>) {
        setContent(e.target.value)

        if (e.target.value === '') {
            setShouldShowOnboarding(true)
        }
    }

    function handleSaveNote(e: FormEvent) {
        e.preventDefault()

        if(content === '') {
            return
        }

        oneNoteCreate(content)

        setContent("")
        setShouldShowOnboarding(true)

        toast.success("Nota criada com sucesso!")
    }

    function handleStartRecording() {
        const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window
            || 'webkitSpeechRecognition' in window

        if(!isSpeechRecognitionAPIAvailable) {
            alert("Infelizmente seu navegador não suporta a API de gravação!")
            return
        }

        setIsRecording(true)
        setShouldShowOnboarding(false)

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

        speechRecognition = new SpeechRecognitionAPI()

        speechRecognition.lang = "pt-BR"
        speechRecognition.continuous = true
        speechRecognition.maxAlternatives = 1
        speechRecognition.interimResults = true

        speechRecognition.onresult = (e) => {
            const transcription = Array.from(e.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            }, '')

            setContent(transcription)
        }

        speechRecognition.onerror = (e) => {
            console.error(e)
        }

        speechRecognition.start()
    }

    function handleStopRecording() {
        setIsRecording(false)

        if(speechRecognition !== null) {
            speechRecognition.stop()
        }
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger className='rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none'>
                <span className='text-sm font-medium text-slate-200'>
                    Adicionar nota
                </span>
                <p className='text-sm leading-6 text-slate-400'>
                    Grave uma nota em áudio que será convertida para texto automaticamente.
                </p>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className='inset-0 fixed bg-black/50' />
                <Dialog.Content className='fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[600px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none overflow-hidden'>
                    <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
                        <X className='size-5' />
                    </Dialog.Close>

                    <form className='flex-1 flex flex-col'>
                        <div className='flex flex-1 flex-col gap-3 p-5'>
                            <span className='text-sm font-medium text-slate-300'>
                                Adicionar nota
                            </span>

                            {shouldShowOnboarding ? (
                                <p className='text-sm leading-6 text-slate-400'>
                                    Comece <button type="button" onClick={handleStartRecording} className='font-medium text-lime-400 hover:underline'>gravando uma nota</button> em áudio ou se preferir <button type="button" onClick={handleStartEditor} className='font-medium text-lime-400 hover:underline'>utilize apenas texto</button>.
                                </p>
                            ) : (
                                <textarea
                                    autoFocus
                                    className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                                    onChange={handleContentChange}
                                    value={content}
                                />
                            )}
                        </div>

                        {isRecording ? (
                            <button
                                type="button"
                                onClick={handleStopRecording}
                                className='w-full bg-slate-900 py-4 text-center tx-sm text-slate-300 outline-none font-medium hover:text-slate-100 flex items-center justify-center gap-2'
                            >
                                <div className='size-3 rounded-full bg-red-500 animate-pulse'></div>
                                Gravando! (clique p/ interromper)
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSaveNote}
                                className='w-full bg-lime-400 py-4 text-center tx-sm text-lime-950 outline-none font-medium hover:bg-lime-500'
                            >
                                Salvar nota
                            </button>
                        )}
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}