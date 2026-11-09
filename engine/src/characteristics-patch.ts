/**
 * What an effect can make a permanent into: one declaration of it, said by
 * the `become` effect, a copy's exceptions and (its layer 4 and 5 parts) a
 * static. See docs/plans/need-key-themes.md, theme 8's design note.
 *
 * Each field belongs to a layer of rule 613. A {@link CharacteristicsPatch}
 * doesn't apply itself: {@link patchModifier} turns one whose amounts have
 * been read into the fields of a `PtModifier`, which the layer fold reads.
 */

import type { ActivatedAbility, TriggeredAbility } from "./abilities.js";
import type { CardType, Keyword, StaticAbility, Supertype } from "./cards/define.js";
import type { AffectSpec } from "./cards/define.js";
import type { Color } from "./mana.js";
import type { PtModifier } from "./state.js";

/** Layer 4: card types, subtypes and supertypes (rules 205, 613.1d). */
export interface TypePatch {
  /** "Becomes a [type]" with no "in addition": these **replace** its card
   * types (rule 205.1a), and a subtype that went only with a lost type goes
   * too. Supertypes stay. Applied before `addTypes`. */
  readonly setTypes?: readonly CardType[];
  /** Card types it has in addition to its others. */
  readonly addTypes?: readonly CardType[];
  /** "**Isn't** a creature", "isn't an artifact": these go and its others
   * stay, with every subtype that went only with them (205.1a). */
  readonly removeTypes?: readonly CardType[];
  /** Subtypes that replace its subtypes of the same kind (205.1a): "becomes
   * a Frog" takes every creature type and leaves "Equipment" alone. Applied
   * before `addSubtypes`. */
  readonly setSubtypes?: readonly string[];
  /** Subtypes it has in addition to its others. `EVERY_CREATURE_TYPE` is
   * "all creature types" (Amoeboid Changeling). */
  readonly addSubtypes?: readonly string[];
  /** "It **isn't an Equipment**" (Dancing Sword): these go, its types stay. */
  readonly removeSubtypes?: readonly string[];
  /** It loses all land types (rule 305.7 takes the abilities they gave it). */
  readonly loseLandTypes?: true;
  /** It loses all creature types, keeping its other subtypes. */
  readonly loseCreatureTypes?: true;
  /** Supertypes in addition to its others ("becomes snow", "a legendary 4/4"). */
  readonly addSupertypes?: readonly Supertype[];
  /** Supertypes it no longer has ("is no longer snow", "isn't legendary"). */
  readonly removeSupertypes?: readonly Supertype[];
}

/** Layer 5: colours (rules 105.3, 613.1e). */
export interface ColorPatch {
  /** Its colours become exactly these. `[]` is "colorless" (105.2c). Applied
   * before `addColors`; the latest such change wins. */
  readonly setColors?: readonly Color[];
  /** Colours in addition to its others. */
  readonly addColors?: readonly Color[];
}

/**
 * Everything a "becomes" can change. `Pt` is what a P/T can be: on a one-shot,
 * an `EffectAmount` read once as it applies (rule 608.2h); on a copy
 * exception, a number; once read, always a number.
 */
export interface CharacteristicsPatch<Pt> extends TypePatch, ColorPatch {
  /** Its only name for as long as this lasts. */
  readonly name?: string;
  /** It loses all its abilities (layer 6): what it had before this effect,
   * printed or granted. What this same patch gives it, it has (613.7). */
  readonly loseAbilities?: true;
  /** Keywords it has (layer 6). */
  readonly keywords?: readonly Keyword[];
  /** Keywords it loses (layer 6), at this effect's timestamp: a later grant
   * gives one back. */
  readonly loseKeywords?: readonly Keyword[];
  /** Keywords it can't have while this lasts, whatever would give them
   * (Arcane Lighthouse). */
  readonly cantHaveKeywords?: readonly Keyword[];
  /** Toxic N it has, one more instance, added to the total (702.164b). */
  readonly toxic?: number;
  /** Activated abilities it has. */
  readonly activated?: readonly ActivatedAbility[];
  /** Triggered abilities it has. */
  readonly triggered?: readonly TriggeredAbility[];
  /** Static abilities it has. */
  readonly static?: readonly StaticAbility[];
  /** Layer 7b: its base power. Alone, its base toughness stays as it was
   * (613.4b); with neither, its P/T does. */
  readonly power?: Pt;
  /** Layer 7b: its base toughness. See `power`. */
  readonly toughness?: Pt;
}

/** A patch with its amounts read. */
export type ResolvedPatch = CharacteristicsPatch<number>;

/**
 * What a copy effect makes different about its copy (rule 707.9b): every field
 * of the patch, and what only a copy can say. All of it is part of the copy's
 * copiable values, so anything that copies the copy copies this too.
 */
export interface CopyExceptions<Pt = number> extends CharacteristicsPatch<Pt> {
  /** "…with no mana cost" (eternalize, embalm): its mana value is 0. */
  readonly noManaCost?: boolean;
  /** "…except it has **this ability**" (Thespian's Stage, Court of Vantress):
   * the ability of `card`'s definition at that index of its `activated` or
   * `triggered` list, the very ability making the copy, named by its card
   * rather than by the object, which by then may be a copy of something else
   * that has it only this way. Looked up as the copy is made. */
  readonly thisAbility?: {
    readonly card: string;
    readonly activated?: number;
    readonly triggered?: number;
  };
  /** "The legend rule doesn't apply to [these permanents]" as an ability it
   * has (Sakashima of a Thousand Faces). The scope is read from the copy's
   * own side, as the static's `affects` is. */
  readonly legendRuleOff?: AffectSpec;
  /**
   * Pieces that apply only if the copied values are of `ofType` (rule 707.9a
   * reads what's copied, not what's now on it): "and, **if it's a creature**,
   * it has changeling" (Moritte of the Frost).
   */
  readonly ifCopied?: readonly { readonly ofType: CardType; readonly patch: CharacteristicsPatch<Pt> }[];
}

/** A static's base P/T value: `"its-mana-value"` and `countersOnIt` read the
 * permanent it reaches, `sourceCount` the static's own side, all live. */
export type StaticPt<Count> =
  | number
  | "its-mana-value"
  | { readonly countersOnIt: string }
  | { readonly sourceCount: Count };

/** Whether `patch` does anything to its colours and nothing else: such a
 * patch also reaches a spell on the stack (rule 105.3). */
export function changesOnlyColors(patch: ResolvedPatch): boolean {
  return patch.setColors !== undefined || patch.addColors !== undefined
    ? Object.keys(patch).every((key) => key === "setColors" || key === "addColors")
    : false;
}

/** Whether `patch` changes a card type or a named subtype, what the log says. */
export function changesTypes(patch: TypePatch): boolean {
  return (
    patch.setTypes !== undefined ||
    (patch.addTypes !== undefined && patch.addTypes.length > 0) ||
    patch.removeTypes !== undefined ||
    patch.setSubtypes !== undefined ||
    (patch.addSubtypes !== undefined && patch.addSubtypes.length > 0) ||
    patch.removeSubtypes !== undefined
  );
}

/** The `PtModifier` fields of `patch`, its keywords as given. The caller adds
 * the timestamp and how long it lasts. */
export function patchModifier(
  patch: ResolvedPatch,
  keywords: readonly Keyword[] = patch.keywords ?? [],
): Pick<PtModifier, "power" | "toughness" | "keywords"> & Partial<PtModifier> {
  const { power, toughness } = patch;
  return {
    power: 0,
    toughness: 0,
    keywords: [...keywords],
    ...(patch.setTypes !== undefined ? { setTypes: [...patch.setTypes] } : {}),
    ...(patch.addTypes !== undefined && patch.addTypes.length > 0 ? { addTypes: [...patch.addTypes] } : {}),
    ...(patch.removeTypes !== undefined ? { removeTypes: [...patch.removeTypes] } : {}),
    ...(patch.setSubtypes !== undefined ? { setSubtypes: [...patch.setSubtypes] } : {}),
    ...(patch.addSubtypes !== undefined && patch.addSubtypes.length > 0 ? { addSubtypes: [...patch.addSubtypes] } : {}),
    ...(patch.removeSubtypes !== undefined ? { removeSubtypes: [...patch.removeSubtypes] } : {}),
    ...(patch.loseLandTypes === true ? { loseLandTypes: true as const } : {}),
    ...(patch.loseCreatureTypes === true ? { loseCreatureTypes: true as const } : {}),
    ...(patch.addSupertypes !== undefined ? { addSupertypes: [...patch.addSupertypes] } : {}),
    ...(patch.removeSupertypes !== undefined ? { removeSupertypes: [...patch.removeSupertypes] } : {}),
    ...(patch.setColors !== undefined ? { setColors: [...patch.setColors] } : {}),
    ...(patch.addColors !== undefined ? { addColors: [...patch.addColors] } : {}),
    ...(patch.name !== undefined ? { setName: patch.name } : {}),
    ...(patch.loseAbilities === true ? { loseAbilities: true } : {}),
    ...(patch.loseKeywords !== undefined ? { loseKeywords: [...patch.loseKeywords] } : {}),
    ...(patch.cantHaveKeywords !== undefined ? { cantHaveKeywords: [...patch.cantHaveKeywords] } : {}),
    ...(patch.toxic !== undefined ? { toxic: patch.toxic } : {}),
    ...(patch.activated !== undefined && patch.activated.length > 0 ? { grantsActivated: [...patch.activated] } : {}),
    ...(patch.triggered !== undefined && patch.triggered.length > 0 ? { grantsTriggered: [...patch.triggered] } : {}),
    ...(patch.static !== undefined && patch.static.length > 0 ? { grantsStatic: [...patch.static] } : {}),
    ...(power !== undefined && toughness !== undefined
      ? { setPt: [power, toughness] as [number, number] }
      : power !== undefined
        ? { setPower: power }
        : toughness !== undefined
          ? { setToughness: toughness }
          : {}),
  };
}
