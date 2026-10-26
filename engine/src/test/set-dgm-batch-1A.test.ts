/**
 * Dragon's Maze (DGM; B173) — group A.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  blockOffer,
  cast,
  counters,
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
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Awe for the Guilds", () => {
  it("monocolored creatures can't block, a later one too; multicolored and colorless still can", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const attacker = spawn(game, "Grizzly Bears");
    const mono = spawn(game, "Grizzly Bears", B);
    const multi = spawn(game, "Watchwolf", B);
    const colorless = spawn(game, "Ornithopter", B);
    cast(game, toHand(game, "Awe for the Guilds"));
    const late = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [attacker]);
    const canBlock = (id: string): readonly string[] => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(mono)).toEqual([]);
    expect(canBlock(late)).toEqual([]);
    expect(canBlock(multi)).toEqual([attacker]);
    expect(canBlock(colorless)).toEqual([attacker]);
  });
});

describe("Blaze Commando", () => {
  it("an instant dealing damage makes two hasty Soldiers", () => {
    const { game } = table();
    spawn(game, "Blaze Commando");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(tokensNamed(game, "Red-White Soldier Token", A)).toBe(2);
  });
});

describe("Blood Baron of Vizkopa", () => {
  it("is 10/10 flying only with you at 30+ and an opponent at 10 or less", () => {
    const { game } = table();
    const baron = spawn(game, "Blood Baron of Vizkopa");
    game.state.players[A].life = 30;
    expect(pt(game, baron)).toEqual({ power: 4, toughness: 4 });
    game.state.players[B].life = 10;
    expect(pt(game, baron)).toEqual({ power: 10, toughness: 10 });
    expect(keywords(game, baron).has("flying")).toBe(true);
    game.state.players[A].life = 29;
    expect(pt(game, baron)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Emmara Tandris", () => {
  it("prevents damage to your creature tokens, not to your nontoken creatures", () => {
    const { game } = table();
    spawn(game, "Emmara Tandris");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    const token = game.battlefield.find((id) => game.state.objects[id].isToken)!;
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(token)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, token)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Mutant's Prey", () => {
  it("needs a +1/+1 counter on the first target, then fights", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const prey = toHand(game, "Mutant's Prey");
    expect(() => cast(game, prey, { targets: [ref(bears), ref(theirs)] })).toThrow();
    game.state.objects[bears].counters["+1/+1"] = 1;
    cast(game, prey, { targets: [ref(bears), ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Opal Lake Gatekeepers", () => {
  it("draws with two Gates, and doesn't ask with one", () => {
    const { game, a } = table();
    pickModes(a, 0);
    spawn(game, "Azorius Guildgate");
    let before = hand(game).length;
    enter(game, "Opal Lake Gatekeepers");
    expect(hand(game).length).toBe(before);
    spawn(game, "Azorius Guildgate");
    before = hand(game).length;
    enter(game, "Opal Lake Gatekeepers");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Renounce the Guilds", () => {
  it("each player sacrifices a multicolored permanent; monocolored ones stay", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const wolf = spawn(game, "Watchwolf", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Renounce the Guilds"));
    expect(zone(game, wolf)).toBe("graveyard");
    expect(zone(game, theirBears)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Runner's Bane", () => {
  it("taps a small creature, and falls off once its power rises to 4", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    lands(game, "Forest", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    const bane = toHand(game, "Runner's Bane");
    pickTargets(a, theirs);
    cast(game, bane, { targets: [ref(theirs)] });
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(zone(game, bane)).toBe("battlefield");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(theirs)] });
    expect(zone(game, bane)).toBe("graveyard");
  });
});

describe("Showstopper", () => {
  it("a creature you control that dies this turn deals 2 to an opponent's creature", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Showstopper"));
    pickTargets(a, theirs);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Weapon Surge", () => {
  it("overloaded, every creature you control gets +1/+0 and first strike", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Weapon Surge"), { overload: true });
    for (const id of [one, two]) {
      expect(pt(game, id)).toEqual({ power: 3, toughness: 2 });
      expect(keywords(game, id).has("first-strike")).toBe(true);
    }
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Maze Rusher", () => {
  it("gives haste to multicolored creatures you control only", () => {
    const { game } = table();
    spawn(game, "Maze Rusher");
    const wolf = spawn(game, "Watchwolf");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, wolf).has("haste")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(false);
  });
});
