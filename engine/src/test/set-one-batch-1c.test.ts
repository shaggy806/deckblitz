/**
 * Phyrexia: All Will Be One (ONE/ONC), batch 1, part c (2026-10-17). Written on the shared
 * table in `harness.ts`, each test from the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
  nextTurn,
} from "./harness.js";

const poison = (game: Game, player: PlayerId): number => game.state.players[player].counters.poison ?? 0;
const givePoison = (game: Game, amount: number): void =>
  game.debugApplyEffect(A, { kind: "add-player-counters", counter: "poison", amount, who: "each-opponent" });

describe("Vulshok Factory", () => {
  it("taps for {R} and gets a charge counter", () => {
    const { game } = table();
    const factory = spawn(game, "Vulshok Factory");
    activate(game, factory, 0);
    expect(counters(game, factory, "charge")).toBe(1);
    expect(poolCounts(game.state.players[A].manaPool)).toMatchObject({ R: 1, C: 0 });
  });

  it("makes an X/X hasty Golem from the charge counters it had as it was sacrificed", () => {
    const { game } = table();
    const factory = spawn(game, "Vulshok Factory");
    game.state.objects[factory].counters.charge = 3;
    lands(game, "Mountain", 3);
    activate(game, factory, 1);
    expect(zone(game, factory)).toBe("graveyard");
    const [golem] = named(game, "X/X Golem Token (Haste)");
    expect(pt(game, golem)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, golem).has("haste")).toBe(true);
  });
});

describe("Malcator, Purity Overseer", () => {
  it("makes a Golem at your end step only if three or more artifacts entered under your control this turn", () => {
    const { game } = table();
    enter(game, "Malcator, Purity Overseer");
    expect(tokensNamed(game, "Phyrexian Golem Token", A)).toBe(1); // its enters trigger — the first artifact
    enter(game, "Ornithopter");
    enter(game, "Ornithopter");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Phyrexian Golem Token", A)).toBe(2);
  });

  it("does nothing with only two", () => {
    const { game } = table();
    spawn(game, "Malcator, Purity Overseer");
    enter(game, "Ornithopter");
    enter(game, "Ornithopter");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Phyrexian Golem Token", A)).toBe(0);
  });
});

describe("Gitaxian Anatomist", () => {
  it("proliferates if you tap it", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[bear].counters["+1/+1"] = 1;
    pickModes(a, 0);
    const anatomist = enter(game, "Gitaxian Anatomist");
    expect(game.state.objects[anatomist].tapped).toBe(true);
    expect(counters(game, bear)).toBe(2);
  });

  it("doesn't proliferate if you don't tap it", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[bear].counters["+1/+1"] = 1;
    pickModes(a);
    const anatomist = enter(game, "Gitaxian Anatomist");
    expect(game.state.objects[anatomist].tapped).toBe(false);
    expect(counters(game, bear)).toBe(1);
  });

  it("can't proliferate when it entered tapped — there's no tapping it", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[bear].counters["+1/+1"] = 1;
    pickModes(a, 0);
    game.debugSpawn("Gitaxian Anatomist", A, "battlefield", { announceEntry: true, tapped: true });
    settle(game);
    expect(counters(game, bear)).toBe(1);
  });
});

describe("Mite Overseer", () => {
  it("gives creature tokens you control +1/+0 and first strike during your turn only", () => {
    const { game } = table();
    spawn(game, "Mite Overseer");
    const mint = (player: PlayerId) => {
      game.debugApplyEffect(player, { kind: "create-token", token: "Phyrexian Mite Token", count: 1 });
      settle(game);
      return named(game, "Phyrexian Mite Token", player)[0];
    };
    const mite = mint(A);
    const bear = spawn(game, "Grizzly Bears");
    const theirs = mint(B);
    expect(pt(game, mite)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, mite).has("first-strike")).toBe(true);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    nextTurn(game);
    expect(pt(game, mite)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, mite).has("first-strike")).toBe(false);
  });

  it("makes a Phyrexian Mite", () => {
    const { game } = table();
    const overseer = spawn(game, "Mite Overseer");
    lands(game, "Plains", 4);
    activate(game, overseer, 0);
    expect(tokensNamed(game, "Phyrexian Mite Token", A)).toBe(1);
  });
});

describe("Fleshless Gladiator", () => {
  it("returns from the graveyard tapped, losing you 1 life, only once an opponent has three poison counters", () => {
    const { game } = table();
    const gladiator = toGraveyard(game, "Fleshless Gladiator");
    lands(game, "Swamp", 3);
    expect(() => activate(game, gladiator, 0)).toThrow();
    givePoison(game, 3);
    activate(game, gladiator, 0);
    expect(zone(game, gladiator)).toBe("battlefield");
    expect(game.state.objects[gladiator].tapped).toBe(true);
    expect(life(game, A)).toBe(19);
  });
});

describe("Against All Odds", () => {
  it("with both modes, blinks your creature and returns a cheap artifact or creature card", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[bear].counters["+1/+1"] = 1;
    const memnite = toGraveyard(game, "Memnite");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Against All Odds"), { modes: [0, 1], targets: [ref(bear), ref(memnite)] });
    const [blinked] = named(game, "Grizzly Bears", A);
    expect(blinked).toBeDefined();
    expect(counters(game, blinked)).toBe(0);
    expect(zone(game, memnite)).toBe("battlefield");
  });

  it("can't return a card with mana value 4 or more", () => {
    const { game } = table();
    toGraveyard(game, "Mite Overseer");
    lands(game, "Plains", 4);
    const card = toHand(game, "Against All Odds");
    const overseer = graveyard(game, A).find((id) => game.state.objects[id].cardName === "Mite Overseer")!;
    expect(() => cast(game, card, { modes: [1], targets: [ref(overseer)] })).toThrow();
  });
});

describe("Charforger", () => {
  it("gets an oil counter when another artifact or creature you control goes to the graveyard, and impulse-draws for three", () => {
    const { game } = table();
    const forger = spawn(game, "Charforger");
    destroy(game, spawn(game, "Mind Stone"));
    expect(counters(game, forger, "oil")).toBe(1);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(counters(game, forger, "oil")).toBe(2);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, forger, "oil")).toBe(2);
    game.state.objects[forger].counters.oil = 3;
    activate(game, forger, 0);
    expect(counters(game, forger, "oil")).toBe(0);
    expect(game.state.zones.shared.exile).toHaveLength(1);
  });
});

describe("Sheoldred's Headcleaver", () => {
  it("has toxic 2", () => {
    const { game, a } = table();
    const cleaver = spawn(game, "Sheoldred's Headcleaver");
    attack(game, a, [cleaver]);
    expect(life(game, B)).toBe(18);
    expect(poison(game, B)).toBe(2);
  });
});

describe("Font of Progress", () => {
  it("enters with two oil counters and mills that many", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const font = toHand(game, "Font of Progress");
    cast(game, font);
    expect(counters(game, font, "oil")).toBe(2);
    activate(game, font, 0, { targets: [ref(B)] });
    expect(graveyard(game, B)).toHaveLength(2);
  });
});

describe("Veil of Assimilation", () => {
  it("pumps a creature you control when another artifact you control enters", () => {
    const { game, a } = table();
    spawn(game, "Veil of Assimilation");
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    enter(game, "Ornithopter");
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bear).has("vigilance")).toBe(true);
  });
});

describe("Furnace Skullbomb", () => {
  it("puts two oil counters on your artifact or creature and draws", () => {
    const { game } = table();
    const bomb = spawn(game, "Furnace Skullbomb");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    const before = hand(game).length;
    activate(game, bomb, 1, { targets: [ref(bear)] });
    expect(counters(game, bear, "oil")).toBe(2);
    expect(hand(game)).toHaveLength(before + 1);
    expect(zone(game, bomb)).toBe("graveyard");
  });
});

describe("Sawblade Scamp", () => {
  it("removes an oil counter to deal 1 damage to each opponent", () => {
    const { game, players } = table({ players: 3 });
    const scamp = spawn(game, "Sawblade Scamp");
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, scamp, "oil")).toBe(0); // a creature spell
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, scamp, "oil")).toBe(1);
    activate(game, scamp, 0);
    expect(life(game, B)).toBe(17);
    expect(life(game, players[2])).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});
