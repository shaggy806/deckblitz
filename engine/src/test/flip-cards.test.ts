/**
 * Flip cards (rule 710): the `flip` effect, the flipped status
 * (`GameObject.flipped`, rule 110.5) and how a copy reads it (707.3), on the
 * Kamigawa flip cards.
 */

import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";
import { viewFor } from "../view.js";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  supertypes,
  table,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const shown = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);

describe("flip cards (rule 710)", () => {
  it("Jushi Apprentice flips into Tomoya with nine cards in hand, keeping its mana cost and colour", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const jushi = spawn(game, "Jushi Apprentice");
    expect(hand(game).length).toBe(8);
    activate(game, jushi);
    expect(hand(game).length).toBe(9);
    expect(shown(game, jushi)).toBe("Tomoya the Revealer");
    expect(supertypes(game, jushi)).toContain("legendary");
    expect(pt(game, jushi)).toEqual({ power: 2, toughness: 3 });
    // Rule 710.1c: the mana cost and colour don't change.
    expect([...game.characteristics(jushi).colors]).toEqual(["U"]);
    const view = viewFor(game.state, registryOf(game), A).objects[jushi];
    expect(view?.faceName).toBe("Tomoya the Revealer");
    expect(view?.manaCost).toBe("{1}{U}");
  });

  it("doesn't flip with fewer than nine cards, and a flipped one that leaves forgets it (710.4)", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const jushi = spawn(game, "Jushi Apprentice");
    game.state.zones.perPlayer[A].hand.splice(0, 2);
    activate(game, jushi);
    expect(shown(game, jushi)).toBe("Jushi Apprentice");
    game.state.objects[jushi].flipped = true;
    game.state.objects[jushi].flippedName = "Tomoya the Revealer";
    destroy(game, jushi);
    expect(zone(game, jushi)).toBe("graveyard");
    expect(shown(game, jushi)).toBe("Jushi Apprentice");
    expect(game.state.objects[jushi].flipped).toBeUndefined();
  });

  it("is cast only as its normal half", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const card = toHand(game, "Jushi Apprentice");
    expect(() => cast(game, card, { face: 1 })).toThrow();
    cast(game, card);
    expect(shown(game, card)).toBe("Jushi Apprentice");
  });

  it("a token copy of a flipped permanent is the unflipped card (707.3)", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 3);
    const jushi = spawn(game, "Jushi Apprentice");
    activate(game, jushi);
    expect(shown(game, jushi)).toBe("Tomoya the Revealer");
    const counterpart = toHand(game, "Cackling Counterpart");
    lands(game, "Island", 3);
    cast(game, counterpart, { targets: [ref(jushi)] });
    const [copy] = named(game, "Jushi Apprentice").filter((id) => id !== jushi);
    expect(copy).toBeDefined();
    expect(shown(game, copy!)).toBe("Jushi Apprentice");
    expect(supertypes(game, copy!)).not.toContain("legendary");
  });

  it("Homura returns flipped when it dies: an enchantment, not a creature", () => {
    const { game } = table();
    const homura = spawn(game, "Homura, Human Ascendant");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, homura);
    settle(game);
    expect(zone(game, homura)).toBe("battlefield");
    expect(shown(game, homura)).toBe("Homura's Essence");
    expect(types(game, homura)).toEqual(["enchantment"]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(game.characteristics(bears).keywords.has("flying")).toBe(true);
  });

  it("Callow Jushi takes ki counters, may flip at the end step, and Jaraku spends them", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const jushi = spawn(game, "Callow Jushi");
    for (let i = 0; i < 2; i += 1) {
      pickModes(a, 0);
      cast(game, toHand(game, "Reach Through Mists"));
    }
    expect(game.state.objects[jushi].counters?.ki).toBe(2);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(shown(game, jushi)).toBe("Jaraku the Interloper");
    expect(game.state.objects[jushi].counters?.ki).toBe(2);
  });

  it("Rune-Tail flips as soon as you have 30 or more life", () => {
    const { game } = table();
    const rune = spawn(game, "Rune-Tail, Kitsune Ascendant");
    game.state.players[A].life = 30;
    settle(game);
    nextTurn(game);
    expect(shown(game, rune)).toBe("Rune-Tail's Essence");
  });

  it("Initiate of Blood flips when the creature it damaged dies this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const initiate = spawn(game, "Initiate of Blood");
    const giant = spawn(game, "Hill Giant", B);
    // Only a creature dealt damage this turn is a legal target.
    expect(() => activate(game, initiate, 0, { targets: [ref(giant)] })).toThrow();
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    activate(game, initiate, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(shown(game, initiate)).toBe("Goka the Unjust");
  });

  it("Tok-Tok adds 1 to a red source's damage to any player", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const lava = spawn(game, "Akki Lavarunner");
    game.state.objects[lava].flipped = true;
    game.state.objects[lava].flippedName = "Tok-Tok, Volcano Born";
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(17);
  });
});
