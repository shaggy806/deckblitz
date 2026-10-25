/**
 * Fate Reforged, group D. One test per clause most likely to be wrong:
 * Ojutai's held tap, Marang River Prowler's graveyard permission, Fearsome Awakening's Dragon check,
 * Dragonrage's mana and granted firebreathing, Grave Strength's count, Sudden
 * Reclamation's two picks, Qarsi High Priest's manifest, Frontier Mastodon's
 * ferocious counter, Ruthless Instincts' first mode, Fierce Invocation's
 * counters and Diplomacy of the Wastes' Warrior clause.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const faceDown = (game: Game, player = A): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined && game.state.objects[id].controller === player);

describe("Ojutai, Soul of Winter", () => {
  it("a Dragon attacking taps an opponent's nonland permanent, which skips its next untap", () => {
    const { game, a } = table();
    const ojutai = spawn(game, "Ojutai, Soul of Winter");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    attack(game, a, [ojutai]);
    expect(isTapped(game, bears)).toBe(true);
    nextTurn(game);
    expect(isTapped(game, bears)).toBe(true);
  });
});

describe("Marang River Prowler", () => {
  it("can be cast from the graveyard only while you control a black or green permanent", () => {
    const { game } = table();
    const prowler = toGraveyard(game, "Marang River Prowler");
    lands(game, "Island", 3);
    expect(() => cast(game, prowler, { via: "graveyard-permission" })).toThrow();
    spawn(game, "Llanowar Elves");
    cast(game, prowler, { via: "graveyard-permission" });
    expect(zone(game, prowler)).toBe("battlefield");
  });
});

describe("Fearsome Awakening", () => {
  it("a returned Dragon gets two +1/+1 counters; anything else none", () => {
    const { game } = table();
    const dragon = toGraveyard(game, "Shivan Dragon");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 10);
    cast(game, toHand(game, "Fearsome Awakening"), { targets: [ref(dragon)] });
    cast(game, toHand(game, "Fearsome Awakening"), { targets: [ref(bears)] });
    const [d] = named(game, "Shivan Dragon", A);
    const [g] = named(game, "Grizzly Bears", A);
    expect(counters(game, d)).toBe(2);
    expect(counters(game, g)).toBe(0);
  });
});

describe("Dragonrage", () => {
  it("adds {R} per attacker, and attackers gain {R}: +1/+0", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    a.declareAttackersFn = () => [one, two].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-attackers");
    settle(game);
    cast(game, toHand(game, "Dragonrage"));
    expect(game.state.players[A].manaPool.length).toBe(2);
    activate(game, one, 0);
    activate(game, one, 0);
    expect(pt(game, one)).toEqual({ power: 4, toughness: 2 });
    expect(() => activate(game, home, 0)).toThrow();
  });
});

describe("Grave Strength", () => {
  it("counts every creature card in your graveyard after the mill", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    toGraveyard(game, "Llanowar Elves");
    const target = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Grave Strength"), { targets: [ref(target)] });
    expect(counters(game, target)).toBe(4);
  });
});

describe("Sudden Reclamation", () => {
  it("mills four, then returns a creature card and a land card", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    const before = hand(game).length;
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    cast(game, toHand(game, "Sudden Reclamation"));
    const names = hand(game).map((id) => game.state.objects[id].cardName);
    expect(hand(game).length).toBe(before + 2);
    expect(names).toContain("Grizzly Bears");
    expect(names).toContain("Wastes");
    expect(graveyard(game).length).toBe(3); // two milled Wastes left, plus the spell
  });
});

describe("Qarsi High Priest", () => {
  it("sacrifices another creature to manifest the top card", () => {
    const { game } = table();
    const priest = spawn(game, "Qarsi High Priest");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    game.dispatch({ type: "activate-ability", player: A, source: priest, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(faceDown(game)).toHaveLength(1);
  });
});

describe("Frontier Mastodon", () => {
  it("enters with a +1/+1 counter only beside a creature with power 4 or greater", () => {
    const { game } = table();
    expect(counters(game, enter(game, "Frontier Mastodon"))).toBe(0);
    spawn(game, "Serra Angel");
    expect(counters(game, enter(game, "Frontier Mastodon"))).toBe(1);
  });
});

describe("Ruthless Instincts", () => {
  it("first mode: a nonattacking creature gains reach and deathtouch and untaps", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Ruthless Instincts"), { modes: [0], targets: [ref(bears)] });
    expect(isTapped(game, bears)).toBe(false);
    expect(keywords(game, bears).has("reach")).toBe(true);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
  });
});

describe("Fierce Invocation", () => {
  it("the manifested creature gets two +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Fierce Invocation"));
    const [manifested] = faceDown(game);
    expect(manifested).toBeDefined();
    expect(pt(game, manifested)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Diplomacy of the Wastes", () => {
  it("you choose a nonland card to discard; with a Warrior they lose 2 life", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    lands(game, "Swamp", 6);
    pickFromZone(a, bears);
    cast(game, toHand(game, "Diplomacy of the Wastes"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    spawn(game, "Abzan Guide");
    cast(game, toHand(game, "Diplomacy of the Wastes"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});
