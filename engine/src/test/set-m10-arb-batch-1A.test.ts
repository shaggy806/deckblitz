/**
 * Magic 2010 and Alara Reborn (M10, ARB; B168), group A. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Fight to the Death", () => {
  it("destroys blockers and blocked attackers, not an unblocked attacker", () => {
    const { game, a, b } = table();
    const blocked = spawn(game, "Grizzly Bears");
    const free = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Mountain");
    spawn(game, "Plains");
    const spell = toHand(game, "Fight to the Death");
    a.declareAttackersFn = () => [
      { attacker: blocked, defender: B },
      { attacker: free, defender: B },
    ];
    b.declareBlockersFn = () => [{ blocker, attacker: blocked }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    cast(game, spell);
    expect(zone(game, blocked)).toBe("graveyard");
    expect(zone(game, blocker)).toBe("graveyard");
    expect(zone(game, free)).toBe("battlefield");
  });

  it("does nothing to attackers before blockers are declared", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears");
    spawn(game, "Mountain");
    spawn(game, "Plains");
    const spell = toHand(game, "Fight to the Death");
    a.declareAttackersFn = () => [{ attacker, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    cast(game, spell);
    expect(zone(game, attacker)).toBe("battlefield");
  });
});

describe("Shield of the Righteous", () => {
  it("the creature its bearer blocks doesn't untap during its controller's next untap step", () => {
    const { game, a, b } = table();
    const shield = spawn(game, "Shield of the Righteous");
    const bearer = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, shield, 0, { targets: [ref(bearer)] });
    expect(pt(game, bearer)).toEqual({ power: 2, toughness: 4 });
    expect(keywords(game, bearer).has("vigilance")).toBe(true);
    const attacker = spawn(game, "Hill Giant", B);
    nextTurn(game); // bob's turn
    a.declareBlockersFn = () => [{ blocker: bearer, attacker }];
    attack(game, b, [attacker], A);
    expect(game.state.objects[attacker].tapped).toBe(true);
    nextTurn(game); // alice's turn
    nextTurn(game); // bob's: his untap step left it tapped
    expect(game.state.objects[attacker].tapped).toBe(true);
    nextTurn(game);
    nextTurn(game); // bob's next: it untaps as usual
    expect(game.state.objects[attacker].tapped).toBe(false);
  });
});

describe("Bant Sojourners", () => {
  it("dying may make a Soldier", () => {
    const { game, a } = table();
    const sojourners = spawn(game, "Bant Sojourners");
    pickModes(a, 0);
    destroy(game, sojourners);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });

  it("cycling may make a Soldier", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    pickModes(a, 0);
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Bant Sojourners") });
    toStep(game, "postcombat-main");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });
});

describe("Tainted Sigil", () => {
  it("gains the life every player lost this turn", () => {
    const { game } = table();
    const sigil = spawn(game, "Tainted Sigil");
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, who: "you" }, []);
    game.debugApplyEffect(B, { kind: "lose-life", amount: 2, who: "you" }, []);
    game.debugApplyEffect(B, { kind: "gain-life", amount: 4, who: "you" }, []);
    activate(game, sigil);
    expect(zone(game, sigil)).toBe("graveyard");
    expect(life(game, A)).toBe(17 + 5);
  });
});

describe("Retaliator Griffin", () => {
  it("gets a counter per damage an opponent's source deals you", () => {
    const { game, a, b } = table();
    const griffin = spawn(game, "Retaliator Griffin");
    const attacker = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    pickModes(a, 0);
    attack(game, b, [attacker], A);
    expect(life(game, A)).toBe(18);
    expect(counters(game, griffin)).toBe(2);
  });
});

describe("Vectis Dominator", () => {
  it("taps the creature unless its controller pays 2 life", () => {
    const { game, b } = table();
    const dominator = spawn(game, "Vectis Dominator");
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(b);
    activate(game, dominator, 0, { targets: [ref(bear)] });
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(life(game, B)).toBe(20);
  });

  it("leaves it untapped when they pay", () => {
    const { game, b } = table();
    const dominator = spawn(game, "Vectis Dominator");
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    activate(game, dominator, 0, { targets: [ref(bear)] });
    expect(game.state.objects[bear].tapped).toBe(false);
    expect(life(game, B)).toBe(18);
  });
});

describe("Naya Hushblade", () => {
  it("needs another multicolored permanent, not itself", () => {
    const { game } = table();
    const hushblade = spawn(game, "Naya Hushblade");
    expect(pt(game, hushblade)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, hushblade).has("shroud")).toBe(false);
    spawn(game, "Jund Hackblade");
    expect(pt(game, hushblade)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, hushblade).has("shroud")).toBe(true);
  });
});

describe("Lightning Reaver", () => {
  it("deals damage equal to its charge counters at your end step", () => {
    const { game, a } = table();
    const reaver = spawn(game, "Lightning Reaver");
    attack(game, a, [reaver]);
    expect(counters(game, reaver, "charge")).toBe(1);
    expect(life(game, B)).toBe(17);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(16);
  });
});

describe("Thraximundar", () => {
  it("makes the defending player sacrifice, and may grow on it", () => {
    const { game, a } = table();
    const thrax = spawn(game, "Thraximundar");
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    attack(game, a, [thrax]);
    expect(zone(game, bear)).toBe("graveyard");
    expect(counters(game, thrax)).toBe(1);
  });
});

describe("Soul Bleed", () => {
  it("drains the enchanted creature's controller on their upkeep", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Soul Bleed"), { targets: [ref(bear)] });
    nextTurn(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});
