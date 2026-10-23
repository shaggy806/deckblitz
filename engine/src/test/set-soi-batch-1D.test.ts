/**
 * Shadows over Innistrad, group D: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const faceName = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);

/** Four card types in alice's graveyard: creature, land, instant, sorcery. */
function delirium(game: Game): void {
  for (const card of ["Grizzly Bears", "Wastes", "Shock", "Divination"]) toGraveyard(game, card);
}

describe("Nahiri, the Harbinger", () => {
  it("−2 takes an enchantment or a tapped artifact or creature only", () => {
    const { game } = table();
    const nahiri = spawn(game, "Nahiri, the Harbinger");
    const untapped = spawn(game, "Grizzly Bears", B);
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    const ring = spawn(game, "Sol Ring", B);
    const tappedRing = spawn(game, "Mind Stone", B, { tapped: true });
    const aura = spawn(game, "Sleep Paralysis", B);
    const index = registryOf(game)
      .get("Nahiri, the Harbinger")
      .activated.findIndex((ab) => ab.loyaltyCost === -2);
    const legal = (id: ObjectId): boolean =>
      game.canDispatch({
        type: "activate-ability",
        player: A,
        source: nahiri,
        abilityIndex: index,
        targets: [ref(id)],
      }) === null;
    expect([tapped, tappedRing, aura].map(legal)).toEqual([true, true, true]);
    expect([untapped, ring].map(legal)).toEqual([false, false]);
    loyalty(game, nahiri, -2, { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("exile");
  });

  it("−8 puts the find onto the battlefield with haste and returns it at the next end step", () => {
    const { game, a } = table();
    const nahiri = spawn(game, "Nahiri, the Harbinger");
    const giant = toLibrary(game, "Hill Giant");
    pickFromZone(a, giant);
    loyalty(game, nahiri, -8, { atLeast: 8 });
    expect(zone(game, giant)).toBe("battlefield");
    expect(keywords(game, giant).has("haste")).toBe(true);
    nextTurn(game);
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Gibbering Fiend", () => {
  it("pings each opponent on entering, and on their upkeep only with delirium", () => {
    const { game } = table();
    enter(game, "Gibbering Fiend");
    expect(life(game, B)).toBe(19);
    nextTurn(game); // bob's upkeep, no delirium
    expect(life(game, B)).toBe(19);
    delirium(game);
    nextTurn(game); // alice's own upkeep: not an opponent's
    expect(life(game, B)).toBe(19);
    nextTurn(game); // bob's upkeep, delirium
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Inexorable Blob", () => {
  it("with delirium, attacking makes a tapped and attacking 3/3 Ooze", () => {
    const { game, a } = table();
    const blob = spawn(game, "Inexorable Blob");
    delirium(game);
    attack(game, a, [blob]);
    expect(tokensNamed(game, "3/3 Ooze Token", A)).toBe(1);
    expect(life(game, B)).toBe(14);
  });

  it("without delirium, makes nothing", () => {
    const { game, a } = table();
    const blob = spawn(game, "Inexorable Blob");
    attack(game, a, [blob]);
    expect(tokensNamed(game, "3/3 Ooze Token", A)).toBe(0);
    expect(life(game, B)).toBe(17);
  });
});

describe("Not Forgotten", () => {
  it("the caster picks the bottom of the owner's library, and gets the Spirit", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickModes(a, 1);
    cast(game, toHand(game, "Not Forgotten"), { targets: [ref(card)] });
    expect(game.state.zones.perPlayer[B].library.at(-1)).toBe(card);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    expect(tokensNamed(game, "Spirit Token", B)).toBe(0);
  });
});

describe("Brain in a Jar", () => {
  it("offers only an instant or sorcery whose mana value is the new counter count, cast free", () => {
    const { game, a } = table();
    const brain = spawn(game, "Brain in a Jar");
    lands(game, "Wastes", 1);
    const shock = toHand(game, "Shock");
    const divination = toHand(game, "Divination");
    const bears = toHand(game, "Grizzly Bears");
    const offered: (readonly ObjectId[])[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered.push(offer.cards);
      const way = offer.casts.find((c) => c.card === shock)!;
      return { type: "cast-spell", player: A, card: shock, targets: [ref(B)], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    activate(game, brain, 0);
    expect(counters(game, brain, "charge")).toBe(1);
    expect(offered[0]).toContain(shock);
    expect(offered[0]).not.toContain(divination);
    expect(offered[0]).not.toContain(bears);
    expect(life(game, B)).toBe(18);
  });
});

describe("Daring Sleuth", () => {
  it("transforms when you sacrifice a Clue", () => {
    const { game } = table();
    const sleuth = spawn(game, "Daring Sleuth");
    lands(game, "Wastes", 2);
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 1 }, []);
    const [clue] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Clue Token");
    activate(game, clue, 0);
    expect(faceName(game, sleuth)).toBe("Bearer of Overwhelming Truths");
  });
});

describe("True-Faith Censer", () => {
  it("+1/+1 and vigilance, and +1/+0 more on a Human", () => {
    const { game } = table();
    const censer = spawn(game, "True-Faith Censer");
    lands(game, "Wastes", 4);
    const cathar = spawn(game, "Veteran Cathar");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, censer, 0, { targets: [ref(cathar)] });
    expect(pt(game, cathar)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, cathar).has("vigilance")).toBe(true);
    activate(game, censer, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, cathar)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Vessel of Nascency", () => {
  it("offers only permanent cards among the top four, and bins the rest", () => {
    const { game, a } = table();
    const vessel = spawn(game, "Vessel of Nascency");
    lands(game, "Forest", 2);
    const divination = toLibrary(game, "Divination");
    const wastes = toLibrary(game, "Wastes");
    const bears = toLibrary(game, "Grizzly Bears");
    const shock = toLibrary(game, "Shock");
    const before = hand(game).length;
    const seen = pickFromZone(a, bears);
    activate(game, vessel, 0);
    expect([...seen.offered].sort()).toEqual([bears, wastes].sort());
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
    for (const id of [divination, wastes, shock]) expect(zone(game, id)).toBe("graveyard");
  });
});
