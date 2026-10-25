/**
 * The set walk, Fate Reforged batch 1, group B (2026-10-25): manifest off a
 * look, a face-up trigger that fights, an Aura's dies trigger reading its
 * host's last-known toughness, a cast restriction, and the Khans "as long as
 * you control a red or white permanent" statics. Written on the shared table
 * in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);

describe("Temur War Shaman", () => {
  it("manifests the top card, and the manifested creature turned face up may fight", () => {
    const { game, a } = table();
    const giant = toLibrary(game, "Hill Giant");
    enter(game, "Temur War Shaman");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].faceDown?.kind).toBe("manifest");

    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    pickTargets(a, bears);
    pickModes(a, 0);
    game.dispatch({ type: "turn-face-up", player: A, permanent: giant } as Action);
    settle(game);
    expect(game.state.objects[giant].faceDown).toBeUndefined();
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Write into Being", () => {
  it("manifests one of the top two and puts the other on the bottom", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    lands(game, "Island", 3);
    const answers: ObjectId[][] = [[bears], [giant]];
    a.chooseFromZoneFn = () => answers.shift() ?? [];
    cast(game, toHand(game, "Write into Being"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].faceDown?.kind).toBe("manifest");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(giant);
  });

  it("can leave the other card on top", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    lands(game, "Island", 3);
    const answers: ObjectId[][] = [[giant], []];
    a.chooseFromZoneFn = () => answers.shift() ?? [];
    cast(game, toHand(game, "Write into Being"));
    expect(game.state.objects[giant].faceDown?.kind).toBe("manifest");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(bears);
  });
});

describe("Fruit of the First Tree", () => {
  it("gains life and draws equal to the enchanted creature's toughness as it last existed", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Glorious Anthem");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Fruit of the First Tree"), { targets: [ref(bears)] });
    const handBefore = hand(game).length;
    destroy(game, bears);
    settle(game);
    expect(life(game)).toBe(23);
    expect(hand(game).length).toBe(handBefore + 3);
  });
});

describe("Hewed Stone Retainers", () => {
  it("can be cast only once you've cast another spell this turn", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const retainers = toHand(game, "Hewed Stone Retainers");
    expect(canCast(game, retainers)).toBe(false);
    cast(game, toHand(game, "Ornithopter"));
    expect(canCast(game, retainers)).toBe(true);
  });
});

describe("Mardu Woe-Reaper", () => {
  it("triggers for another Warrior entering, exiling a creature card for 1 life, and not for a non-Warrior", () => {
    const { game, a } = table();
    spawn(game, "Mardu Woe-Reaper");
    const dead = toGraveyard(game, "Grizzly Bears", B);
    const other = toGraveyard(game, "Hill Giant", B);
    pickTargets(a, dead);
    pickModes(a, 0);
    enter(game, "Abzan Kin-Guard");
    expect(zone(game, dead)).toBe("exile");
    expect(life(game)).toBe(21);
    pickTargets(a, other);
    enter(game, "Grizzly Bears");
    expect(zone(game, other)).toBe("graveyard");
    expect(life(game)).toBe(21);
  });
});

describe("Battle Brawler", () => {
  it("gets +1/+0 and first strike only while you control a red or white permanent", () => {
    const { game } = table();
    const brawler = spawn(game, "Battle Brawler");
    expect(pt(game, brawler)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, brawler).has("first-strike")).toBe(false);
    spawn(game, "Raging Goblin", B);
    expect(pt(game, brawler)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Raging Goblin");
    expect(pt(game, brawler)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, brawler).has("first-strike")).toBe(true);
  });
});

describe("Renowned Weaponsmith", () => {
  it("finds Vial of Dragonfire by name", () => {
    const { game, a } = table();
    const smith = spawn(game, "Renowned Weaponsmith");
    const vial = toLibrary(game, "Vial of Dragonfire");
    lands(game, "Island", 1);
    a.chooseFromZoneFn = (_view, eligible) => {
      expect(eligible).toEqual([vial]);
      return [vial];
    };
    activate(game, smith, 1);
    expect(zone(game, vial)).toBe("hand");
  });
});

describe("Shockmaw Dragon", () => {
  it("deals 1 damage to each creature the damaged player controls", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Shockmaw Dragon");
    const bobs = spawn(game, "Raging Goblin", B);
    const mine = spawn(game, "Raging Goblin");
    attack(game, a, [dragon]);
    expect(life(game, B)).toBe(16);
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});
