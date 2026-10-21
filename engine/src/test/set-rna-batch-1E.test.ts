import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  keywords,
  lands,
  life,
  loyalty,
  named,
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
} from "./harness.js";

// Ravnica Allegiance, batch 1, group E.

describe("Consecrate // Consume", () => {
  it("Consume: the target player sacrifices their greatest-power creature and you gain its power", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Consecrate // Consume"), { face: 2, targets: [ref(B)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(23);
  });
});

describe("Repudiate // Replicate", () => {
  it("Replicate: creates a token copy of target creature you control", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Repudiate // Replicate"), { face: 2, targets: [ref(bears)] });
    expect(named(game, "Grizzly Bears", A)).toHaveLength(2);
  });
});

describe("Rumbling Ruin", () => {
  it("locks the counter count as it resolves, but reads each blocker's power live", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(mine)]);
    const small = spawn(game, "Grizzly Bears", B);
    const shrinking = spawn(game, "Hill Giant", B);
    const growing = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const ruin = enter(game, "Rumbling Ruin");
    // A third counter after it resolved doesn't raise the number from 2.
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(mine)]);
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" }, [
      ref(shrinking),
    ]);
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" }, [
      ref(growing),
    ]);
    settle(game);
    const offer = blockOffer(game, a, [ruin], B);
    const blockers = offer.eligible.filter((e) => e.canBlock.length > 0).map((e) => e.blocker);
    expect(blockers).not.toContain(small);
    expect(blockers).not.toContain(shrinking);
    expect(blockers).toContain(growing);
    expect(blockers).toContain(giant);
  });
});

describe("Dovin, Grand Arbiter", () => {
  it("+1: a loyalty counter for each creature that deals combat damage to a player this turn", () => {
    const { game, a } = table();
    const dovin = spawn(game, "Dovin, Grand Arbiter");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    loyalty(game, dovin, 1, { atLeast: 3 });
    expect(counters(game, dovin, "loyalty")).toBe(4);
    attack(game, a, [x, y]);
    expect(counters(game, dovin, "loyalty")).toBe(6);
  });
});

describe("Arrester's Zeal", () => {
  it("gives flying only when cast during your main phase", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Arrester's Zeal"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    const other = spawn(game, "Grizzly Bears");
    toStep(game, "begin-combat");
    cast(game, toHand(game, "Arrester's Zeal"), { targets: [ref(other)] });
    expect(pt(game, other)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, other).has("flying")).toBe(false);
  });
});

describe("Plaza of Harmony", () => {
  it("gains 3 life only if you control two or more Gates", () => {
    const { game } = table();
    spawn(game, "Azorius Guildgate");
    enter(game, "Plaza of Harmony");
    expect(life(game, A)).toBe(20);
    spawn(game, "Gruul Guildgate");
    enter(game, "Plaza of Harmony");
    expect(life(game, A)).toBe(23);
  });
});

describe("Pestilent Spirit", () => {
  it("gives your instants deathtouch", () => {
    const { game } = table();
    spawn(game, "Pestilent Spirit");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Gruul Beastmaster", () => {
  it("gives another creature you control +X/+0, X its power", () => {
    const { game, a } = table();
    const master = spawn(game, "Gruul Beastmaster");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [master]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Ethereal Absolution", () => {
  it("anthems both ways, and exiling a creature card from an opponent's graveyard makes a Spirit", () => {
    const { game } = table();
    const absolution = spawn(game, "Ethereal Absolution");
    const giant = spawn(game, "Hill Giant", B);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    const card = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    lands(game, "Swamp", 1);
    activate(game, absolution, 0, { targets: [ref(card)] });
    expect(zone(game, card)).toBe("exile");
    expect(tokensNamed(game, "Spirit Token (White-Black)", A)).toBe(1);
  });
});

describe("Cavalcade of Calamity", () => {
  it("deals 1 damage to the defender when a power-1 creature attacks", () => {
    const { game, a } = table();
    spawn(game, "Cavalcade of Calamity");
    const elves = spawn(game, "Llanowar Elves");
    attack(game, a, [elves]);
    expect(life(game, B)).toBe(18);
  });
});

describe("Dovin's Automaton", () => {
  it("gets +2/+2 and vigilance while you control a Dovin", () => {
    const { game } = table();
    const automaton = spawn(game, "Dovin's Automaton");
    expect(pt(game, automaton)).toEqual({ power: 3, toughness: 3 });
    spawn(game, "Dovin, Grand Arbiter");
    expect(pt(game, automaton)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, automaton).has("vigilance")).toBe(true);
  });
});
