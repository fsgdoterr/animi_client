"use client";

import { Check, Plus, Trash2 } from "lucide-react";

import FieldResetButton from "@/components/ui/admin/shared/field-reset-button";
import { FormField } from "@/components/ui/admin/shared/form-field";
import { Button } from "@/components/ui/buttons/button";
import { Select, type SelectOption } from "@/components/ui/dropdowns/select";
import { Input } from "@/components/ui/inputs/input";
import {
    areSingleEpisodeEqual,
    areVariantsEqual,
    type EpisodeForm,
    type EpisodeVariantForm,
} from "@/components/ui/admin/animes/anime-editor-model";
import {
    dubTypeOptions,
    episodeSourceOptions,
} from "@/components/ui/admin/animes/anime-options";
import cn from "@/lib/utils/cn";

export default function EpisodeEditor({
    episode,
    initialEpisode,
    episodeIndex,
    playerOptions,
    dubTeamOptions,
    onEpisodeChange,
    onResetEpisode,
    onResetEpisodeField,
    onAddVariant,
    onVariantChange,
    onResetVariant,
    onRemoveVariant,
    onRemoveEpisode,
}: {
    episode: EpisodeForm;
    initialEpisode?: EpisodeForm;
    episodeIndex: number;
    playerOptions: SelectOption<string>[];
    dubTeamOptions: SelectOption<string>[];
    onEpisodeChange: <K extends keyof Omit<EpisodeForm, "key">>(
        index: number,
        key: K,
        value: EpisodeForm[K],
    ) => void;
    onResetEpisode: (episodeIndex: number) => void;
    onResetEpisodeField: (
        episodeIndex: number,
        field: "number" | "title",
    ) => void;
    onAddVariant: (episodeIndex: number) => void;
    onVariantChange: (
        episodeIndex: number,
        variantIndex: number,
        patch: Partial<EpisodeVariantForm>,
    ) => void;
    onResetVariant: (episodeIndex: number, variantKey: string) => void;
    onRemoveVariant: (episodeIndex: number, variantIndex: number) => void;
    onRemoveEpisode: (episodeIndex: number) => void;
}) {
    return (
        <div>
            <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-[13px] text-white/35">Серія</p>
                    <h2 className="mt-0.5 text-[21px] text-white/90">
                        {episode.number || "—"}
                    </h2>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    {initialEpisode && (
                        <FieldResetButton
                            disabled={areSingleEpisodeEqual(episode, initialEpisode)}
                            onClick={() => onResetEpisode(episodeIndex)}
                            ariaLabel="Скинути зміни цієї серії"
                        />
                    )}
                    <Button
                        type="button"
                        color="red"
                        variant="soft"
                        onClick={() => onRemoveEpisode(episodeIndex)}
                        className="h-9 px-3 text-[13px] font-normal"
                    >
                        <Trash2 size={15} />
                        Видалити серію
                    </Button>
                </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)]">
                <FormField
                    label="Номер"
                    reset={
                        initialEpisode
                            ? {
                                  disabled: episode.number === initialEpisode.number,
                                  onClick: () =>
                                      onResetEpisodeField(episodeIndex, "number"),
                                  ariaLabel: "Скинути номер серії",
                              }
                            : undefined
                    }
                >
                    <Input
                        type="number"
                        min={1}
                        value={episode.number}
                        onChange={(event) =>
                            onEpisodeChange(episodeIndex, "number", event.target.value)
                        }
                        placeholder="Номер"
                    />
                </FormField>
                <FormField
                    label="Назва"
                    reset={
                        initialEpisode
                            ? {
                                  disabled: episode.title === initialEpisode.title,
                                  onClick: () =>
                                      onResetEpisodeField(episodeIndex, "title"),
                                  ariaLabel: "Скинути назву серії",
                              }
                            : undefined
                    }
                >
                    <Input
                        value={episode.title}
                        onChange={(event) =>
                            onEpisodeChange(episodeIndex, "title", event.target.value)
                        }
                        placeholder="Назва серії (необовʼязково)"
                    />
                </FormField>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-[16px] text-white/82">Варіанти</h3>
                    <p className="mt-0.5 text-[13px] text-white/32">
                        Озвучка/субтитри, плеєр та джерело відтворення.
                    </p>
                </div>
                <Button
                    type="button"
                    color="green"
                    onClick={() => onAddVariant(episodeIndex)}
                >
                    <Plus size={16} />
                    Додати варіант
                </Button>
            </div>

            <div className="mt-3 grid gap-2">
                {episode.variants.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-white/[0.09] px-4 py-8 text-center text-[13px] text-white/30">
                        У цієї серії поки немає варіантів відтворення.
                    </div>
                ) : (
                    episode.variants.map((variant, variantIndex) => {
                        const initialVariant = initialEpisode?.variants.find(
                            (item) => item.key === variant.key,
                        );

                        return (
                            <div
                                key={variant.key}
                                className="rounded-xl border border-[#365064] bg-[#0f151a] p-3 sm:p-4"
                            >
                                {initialVariant && (
                                    <div className="mb-3 flex justify-end">
                                        <FieldResetButton
                                            disabled={areVariantsEqual(variant, initialVariant)}
                                            onClick={() =>
                                                onResetVariant(episodeIndex, variant.key)
                                            }
                                            ariaLabel="Скинути зміни варіанта"
                                        />
                                    </div>
                                )}
                                <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-[190px_minmax(0,1fr)_190px]">
                                    <Select
                                        label="Тип"
                                        value={variant.dubType}
                                        options={dubTypeOptions}
                                        onChange={(value) =>
                                            onVariantChange(episodeIndex, variantIndex, {
                                                dubType: value,
                                            })
                                        }
                                        className="w-full"
                                    />
                                    <Select
                                        label="Команда"
                                        value={variant.dubTeamId}
                                        options={dubTeamOptions}
                                        onChange={(value) =>
                                            onVariantChange(episodeIndex, variantIndex, {
                                                dubTeamId: value,
                                            })
                                        }
                                        placeholder="Оберіть команду"
                                        className="w-full"
                                        dropdownClassName="max-h-64 overflow-y-auto"
                                    />
                                    <Select
                                        label="Плеєр"
                                        value={variant.playerId}
                                        options={playerOptions}
                                        onChange={(value) =>
                                            onVariantChange(episodeIndex, variantIndex, {
                                                playerId: value,
                                            })
                                        }
                                        placeholder="Оберіть плеєр"
                                        className="w-full"
                                        dropdownClassName="max-h-64 overflow-y-auto"
                                    />
                                    <Select
                                        label="Джерело"
                                        value={variant.sourceType}
                                        options={episodeSourceOptions}
                                        onChange={(value) =>
                                            onVariantChange(episodeIndex, variantIndex, {
                                                sourceType: value,
                                            })
                                        }
                                        className="w-full"
                                    />
                                    <Input
                                        value={variant.endpoint}
                                        onChange={(event) =>
                                            onVariantChange(episodeIndex, variantIndex, {
                                                endpoint: event.target.value,
                                            })
                                        }
                                        placeholder="Посилання / endpoint"
                                        wrapperClassName="lg:col-span-1 xl:col-span-2"
                                    />
                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.05] pt-3">
                                    <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-white/52">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onVariantChange(episodeIndex, variantIndex, {
                                                    isActive: !variant.isActive,
                                                })
                                            }
                                            className={cn(
                                                "flex size-5 items-center justify-center rounded border transition",
                                                variant.isActive
                                                    ? "border-(--green) bg-(--green) text-white"
                                                    : "border-white/15 bg-white/[0.025] text-transparent",
                                            )}
                                            aria-pressed={variant.isActive}
                                        >
                                            <Check size={13} strokeWidth={2.5} />
                                        </button>
                                        Активний варіант
                                    </label>
                                    <Button
                                        type="button"
                                        color="red"
                                        variant="soft"
                                        onClick={() =>
                                            onRemoveVariant(episodeIndex, variantIndex)
                                        }
                                        className="h-8 gap-1.5 px-2.5 text-[12px] font-normal"
                                    >
                                        <Trash2 size={14} />
                                        Видалити варіант
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
