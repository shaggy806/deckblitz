/**
 * The set walk, batch 63, part d (2026-10-12): Lorwyn Eclipsed.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { activePlayerOf, faceName } from "../state.js";

import {
  A,
  B,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
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

/** Alice holds priority in Bob's upkeep — an opponent's turn. */
const toOpponentsTurn = (game: Game): void =>
  game.advanceUntil(
    (s) => activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A && s.zones.shared.stack.length === 0,
  );

describe("Tend the Sprigs", () => {
  it("makes a Treefolk once lands and Treefolk you control reach seven, counting the land it fetched", () => {
    const { game, a } = table();
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    lands(game, "Forest", 3);
    lands(game, "Forest", 2);
    spawn(game, "Ironroot Treefolk");
    // An opponent's lands don't count.
    lands(game, "Forest", 3, B);
    cast(game, toHand(game, "Tend the Sprigs"));
    expect(named(game, "Treefolk Token", A)).toHaveLength(1);
    const [token] = named(game, "Treefolk Token", A);
    expect(pt(game, token)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, token).has("reach")).toBe(true);
  });

  it("makes none at six", () => {
    const { game, a } = table();
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Tend the Sprigs"));
    expect(named(game, "Wastes", A).filter((id) => zone(game, id) === "battlefield")).toHaveLength(1);
    expect(named(game, "Treefolk Token", A)).toHaveLength(0);
  });
});

describe("Trystan, Callous Cultivator // Trystan, Penitent Culler", () => {
  it("entering, mills three and gains 2 life only with an Elf card in the graveyard", () => {
    const { game } = table();
    enter(game, "Trystan, Callous Cultivator");
    expect(graveyard(game)).toHaveLength(3);
    expect(life(game, A)).toBe(20);

    toLibrary(game, "Llanowar Elves");
    enter(game, "Trystan, Callous Cultivator");
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Llanowar Elves")).toBe(true);
    expect(life(game, A)).toBe(22);
  });

  it("pays {B} to transform in the first main phase: mills, may exile an Elf card, and each opponent loses 2", () => {
    const { game, a } = table({ step: "upkeep", players: 3 });
    const trystan = spawn(game, "Trystan, Callous Cultivator");
    lands(game, "Swamp", 1);
    const elf = toGraveyard(game, "Llanowar Elves");
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    game.advanceUntil((s) => s.turn.step === "precombat-main" && s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(faceName(game.state.objects[trystan])).toBe("Trystan, Penitent Culler");
    expect(zone(game, elf)).toBe("exile");
    expect(graveyard(game)).toHaveLength(3);
    expect(life(game, B)).toBe(18);
    expect(life(game, "carol" as typeof A)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("the back face's life loss needs an Elf card actually exiled", () => {
    const { game, a } = table({ step: "upkeep" });
    spawn(game, "Trystan, Callous Cultivator");
    lands(game, "Swamp", 1);
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    game.advanceUntil((s) => s.turn.step === "precombat-main" && s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    // Three Wastes milled, no Elf: nothing to exile.
    expect(life(game, B)).toBe(20);
  });
});

describe("Trystan's Command", () => {
  it("returns two permanent cards (not an instant) and pumps and untaps a player's creatures", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Forest", 3);
    const bear = toGraveyard(game, "Grizzly Bears");
    const forest = toGraveyard(game, "Forest");
    const tapped = spawn(game, "Hill Giant", A, { tapped: true });
    cast(game, toHand(game, "Trystan's Command"), { modes: [1, 3], targets: [ref(bear), ref(forest), ref(A)] });
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, forest)).toBe("hand");
    expect(pt(game, tapped)).toEqual({ power: 6, toughness: 6 });
    expect(game.state.objects[tapped].tapped).toBe(false);
  });

  it("offers permanent cards from your graveyard to the return mode, not an instant", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Forest", 3);
    const bolt = toGraveyard(game, "Lightning Bolt");
    const command = toHand(game, "Trystan's Command");
    const bear = toGraveyard(game, "Grizzly Bears");
    const offer = game.legalActions(A).find((x) => x.kind === "cast-spell" && x.card === command);
    if (offer?.kind !== "cast-spell" || offer.castModal === undefined) throw new Error("no modal cast offered");
    const slot0 = offer.castModal.modes[1].targetOptions[0].map((t) => (t.kind === "object" ? t.object : t.player));
    expect(slot0).toContain(bear);
    expect(slot0).not.toContain(bolt);
  });

  it("copies an Elf you control", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Forest", 3);
    const elf = spawn(game, "Llanowar Elves");
    const victim = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Trystan's Command"), { modes: [0, 2], targets: [ref(elf), ref(victim)] });
    expect(named(game, "Llanowar Elves", A).filter((id) => zone(game, id) === "battlefield")).toHaveLength(2);
    expect(zone(game, victim)).toBe("graveyard");
  });
});

describe("Voracious Tome-Skimmer", () => {
  it("on an opponent's turn, may pay 1 life to draw; on your own turn, nothing", () => {
    const { game, a } = table();
    spawn(game, "Voracious Tome-Skimmer");
    lands(game, "Island", 2);
    pickModes(a, 0);
    let before = hand(game).length;
    cast(game, toHand(game, "Opt"));
    // +1 put in hand, -1 cast, +1 Opt's own draw; no Tome-Skimmer draw.
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(20);

    toOpponentsTurn(game);
    before = hand(game).length;
    cast(game, toHand(game, "Opt"));
    expect(life(game, A)).toBe(19);
    // +1 put in hand, -1 cast, +1 Opt, +1 Tome-Skimmer.
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Unwelcome Sprite", () => {
  it("surveils 2 only for a spell cast on an opponent's turn", () => {
    const { game, a } = table();
    spawn(game, "Unwelcome Sprite");
    lands(game, "Mountain", 2);
    let asked = 0;
    a.chooseScryFn = (_view, cards, mode) => {
      if (mode === "surveil") asked += cards.length;
      return [...cards];
    };
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(asked).toBe(0);
    toOpponentsTurn(game);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(asked).toBe(2);
  });
});

describe("Tanufel Rimespeaker", () => {
  it("draws for a spell whose mana value is 4 or more with its X counted", () => {
    const { game } = table();
    spawn(game, "Tanufel Rimespeaker");
    lands(game, "Mountain", 7);
    let before = hand(game).length;
    cast(game, toHand(game, "Fireball"), { x: 2, targets: [ref(B)] });
    expect(hand(game).length).toBe(before);
    before = hand(game).length;
    cast(game, toHand(game, "Fireball"), { x: 3, targets: [ref(B)] });
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Unforgiving Aim", () => {
  it("makes a 2/2 black and green Elf", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Unforgiving Aim"), { modes: [2] });
    const [elf] = named(game, "2/2 Black Green Elf Token", A);
    expect(pt(game, elf)).toEqual({ power: 2, toughness: 2 });
    expect([...game.characteristics(elf).colors].sort()).toEqual(["B", "G"]);
    settle(game);
  });
});

// Not a Lorwyn Eclipsed card: an existing pool card found while authoring
// this batch, whose granted trigger had dropped "or planeswalker".
describe("Hunter's Insight", () => {
  it("draws for combat damage dealt to a planeswalker, not only to a player", () => {
    const g = table();
    const { game } = g;
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const walker = spawn(game, "Ajani, Caller of the Pride", B);
    cast(game, toHand(game, "Hunter's Insight"), { targets: [ref(bears)] });
    const before = hand(game, A).length;
    const startLoyalty = game.state.objects[walker].counters.loyalty;
    attack(game, g.a, [bears], walker);
    expect(game.state.objects[walker].counters.loyalty).toBe(startLoyalty - 2);
    expect(hand(game, A).length).toBe(before + 2);
  });
});
