import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  destroy,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table as openTable,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

// `copy-spell` making one copy per permanent the spell could target (rule
// 707.10d): whoever copies it, judged from its caster's side, all of them or as
// many as are chosen and paid for; and gravestorm (rule 702.69a).

function table(opts: Parameters<typeof openTable>[0] = {}): ReturnType<typeof openTable> {
  const seated = openTable(opts);
  for (const player of seated.players) seated.game.state.zones.perPlayer[player].hand = [];
  return seated;
}

/** Copies on the stack under this player. */
const copiesOf = (game: Game, player: PlayerId): ObjectId[] =>
  game.state.zones.shared.stack.filter((id) => {
    const object = game.state.objects[id];
    return object?.isCopy === true && object.controller === player;
  });

describe("that player copies it (Mirrorwing Dragon)", () => {
  it("the caster's copies, for creatures the caster controls, not Mirrorwing's controller's", () => {
    const { game, b } = table();
    const dragon = spawn(game, "Mirrorwing Dragon", A);
    const alicesOther = spawn(game, "Grizzly Bears", A);
    const bobOne = spawn(game, "Grizzly Bears", B);
    const bobTwo = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1, B);
    game.dispatch({ type: "pass-priority", player: A });
    pickPermanents(b, bobOne, bobTwo);
    cast(game, toHand(game, "Giant Growth", B), { player: B, targets: [ref(dragon)] });
    expect(pt(game, bobOne).power).toBe(5);
    expect(pt(game, bobTwo).power).toBe(5);
    expect(pt(game, dragon).power).toBe(7);
    expect(pt(game, alicesOther).power).toBe(2);
  });

  it("no copies for a spell at something else", () => {
    const { game } = table();
    const dragon = spawn(game, "Mirrorwing Dragon", A);
    const other = spawn(game, "Grizzly Bears", A);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(other)] });
    expect(pt(game, other).power).toBe(5);
    expect(pt(game, dragon).power).toBe(4);
  });
});

describe("each other Golem, whoever controls it (Precursor Golem)", () => {
  it("copies for every other Golem, the targeted one left out", () => {
    const { game, a } = table();
    lands(game, "Wastes", 5);
    const golem = toHand(game, "Precursor Golem");
    cast(game, golem);
    expect(tokensNamed(game, "Golem Token", A)).toBe(2);
    lands(game, "Forest", 1);
    let offered: readonly ObjectId[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offered = eligible;
      return eligible;
    };
    const [token] = named(game, "Golem Token", A);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(token)] });
    // A copy for Precursor and for the other token, none for the one aimed at.
    expect(offered.length).toBe(2);
    expect(offered).toContain(golem);
    expect(offered).not.toContain(token);
    const powers = [golem, ...named(game, "Golem Token", A)].map((id) => pt(game, id).power);
    expect(powers).toEqual([6, 6, 6]);
  });

  it("the caster's copies though the Golems are another player's", () => {
    const { game, a } = table();
    const golem = spawn(game, "Precursor Golem", B);
    const other = spawn(game, "Grizzly Bears", B);
    const token = spawn(game, "Golem Token", B);
    lands(game, "Mountain", 1);
    let asked = false;
    a.choosePermanentsFn = () => {
      asked = true;
      return [];
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(golem)], settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    game.dispatch({ type: "pass-priority", player: B });
    // The trigger resolved: one other Golem, so no order to ask, and Alice's copy.
    expect(asked).toBe(false);
    expect(copiesOf(game, A).length).toBe(1);
    settle(game);
    expect(zone(game, golem)).toBe("graveyard");
    expect(game.state.objects[token]?.zone ?? "gone").not.toBe("battlefield");
    expect(zone(game, other)).toBe("battlefield");
  });

  it("no trigger for a spell aimed at something else", () => {
    const { game } = table();
    const golem = spawn(game, "Precursor Golem");
    const other = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(other)] });
    expect(pt(game, golem).power).toBe(3);
  });
});

describe("could target is the caster's, though another player copies it (Ink-Treader Nephilim)", () => {
  it("copies are the Nephilim's controller's, for every other creature", () => {
    const { game, b } = table();
    const nephilim = spawn(game, "Ink-Treader Nephilim", B);
    const alices = spawn(game, "Grizzly Bears", A);
    const bobs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    let asked: readonly ObjectId[] = [];
    b.choosePermanentsFn = (_view, eligible) => {
      asked = eligible;
      return eligible;
    };
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(nephilim)] });
    expect([...asked].sort()).toEqual([alices, bobs].sort());
    expect(pt(game, alices).power).toBe(5);
    expect(pt(game, bobs).power).toBe(5);
    expect(pt(game, nephilim).power).toBe(6);
  });

  it("the ruling: judged from the caster's side, and a copy its controller couldn't aim doesn't resolve", () => {
    const { game } = table();
    // Bob's "target creature an opponent controls" at Alice's Nephilim: from his
    // side the other such creature is Alice's Bears, not his own.
    const nephilim = spawn(game, "Ink-Treader Nephilim", A);
    const alices = spawn(game, "Grizzly Bears", A);
    const bobs = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    lands(game, "Swamp", 6, B);
    cast(game, toHand(game, "Public Execution", B), { player: B, targets: [ref(nephilim)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    game.dispatch({ type: "pass-priority", player: A });
    // Alice's copy, aimed at her own Bears.
    const [copy] = copiesOf(game, A);
    expect(copy).toBeDefined();
    expect(game.state.objects[copy].targets).toEqual([ref(alices)]);
    settle(game);
    expect(zone(game, nephilim)).toBe("graveyard");
    // Her creature is no target for her own "an opponent controls".
    expect(zone(game, alices)).toBe("battlefield");
    expect(zone(game, bobs)).toBe("battlefield");
  });

  it("the intervening if: a spell that no longer targets only it makes no copies", () => {
    const { game } = table();
    const nephilim = spawn(game, "Ink-Treader Nephilim");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    const growth = toHand(game, "Giant Growth");
    cast(game, growth, { targets: [ref(nephilim)], settle: false });
    expect(game.state.zones.shared.stack.length).toBe(2);
    // Moved off it in response, as a Redirect would.
    game.state.objects[growth].targets = [ref(bears)];
    settle(game);
    expect(pt(game, bears).power).toBe(5);
    expect(pt(game, nephilim).power).toBe(3);
    expect(pt(game, other).power).toBe(2);
  });

  it("no trigger for a spell at something else", () => {
    const { game } = table();
    const nephilim = spawn(game, "Ink-Treader Nephilim");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)], settle: false });
    expect(game.state.zones.shared.stack.length).toBe(1);
    settle(game);
    expect(pt(game, nephilim).power).toBe(3);
  });
});

describe("any number chosen and paid for (Feather, Radiant Arbiter)", () => {
  it("copies only for those chosen, paying {2} each, and each copy goes where it's aimed", () => {
    const { game, a } = table();
    const feather = spawn(game, "Feather, Radiant Arbiter");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears", B);
    const three = spawn(game, "Grizzly Bears");
    const forests = lands(game, "Forest", 5);
    const seen = pickPermanents(a, one, two);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(feather)] });
    expect([...seen.offered].sort()).toEqual([one, two, three].sort());
    expect(pt(game, one).power).toBe(5);
    expect(pt(game, two).power).toBe(5);
    expect(pt(game, three).power).toBe(2);
    expect(forests.filter((id) => game.state.objects[id].tapped).length).toBe(5);
  });

  it("choosing none is declining, and costs nothing", () => {
    const { game, a } = table();
    const feather = spawn(game, "Feather, Radiant Arbiter");
    const one = spawn(game, "Grizzly Bears");
    const forests = lands(game, "Forest", 3);
    pickPermanents(a);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(feather)] });
    expect(pt(game, one).power).toBe(2);
    expect(forests.filter((id) => game.state.objects[id].tapped).length).toBe(1);
  });

  it("offers as many as can be paid for, and asks nothing with no mana left", () => {
    const { game, a } = table();
    const feather = spawn(game, "Feather, Radiant Arbiter");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3); // {G}, then one {2}.
    let most = -1;
    a.choosePermanentsFn = (_view, eligible, _min, max) => {
      most = max;
      return eligible.slice(0, 1);
    };
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(feather)] });
    expect(most).toBe(1);

    most = -1;
    lands(game, "Forest", 1); // {G} alone this time.
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(feather)] });
    expect(most).toBe(-1);
  });

  it("not for a spell aimed at something else", () => {
    const { game, a } = table();
    const feather = spawn(game, "Feather, Radiant Arbiter");
    const other = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    let asked = false;
    a.choosePermanentsFn = () => {
      asked = true;
      return [];
    };
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(other)] });
    expect(asked).toBe(false);
    expect(pt(game, feather).power).toBe(4);
  });

  it("a copy of an Aura spell becomes a token on the creature aimed at (rule 707.10f)", () => {
    const { game, a } = table();
    const feather = spawn(game, "Feather, Radiant Arbiter");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    lands(game, "Plains", 1);
    pickPermanents(a, bears);
    cast(game, toHand(game, "Holy Strength"), { targets: [ref(feather)] });
    expect(pt(game, bears).power).toBe(3);
    expect(pt(game, feather).power).toBe(5);
  });
});

describe("gravestorm (rule 702.69a)", () => {
  it("a copy for each permanent put into a graveyard from the battlefield this turn, anyone's", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Forest", B);
    destroy(game, mine);
    destroy(game, theirs);
    destroy(game, land);
    lands(game, "Swamp", 3);
    // Each copy keeps its target.
    a.chooseTargetsFn = (_view, _name, _specs, legal) => legal.map((options) => options.find((o) => o.kind === "player" && o.player === B) ?? null);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Ominous Harvest"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before + 4);
    expect(life(game, B)).toBe(16);
  });

  it("tokens count, and cards that reach a graveyard from elsewhere don't", () => {
    const { game } = table();
    const token = spawn(game, "Soldier Token");
    destroy(game, token);
    const card = toHand(game, "Forest");
    game.debugMove(card, "graveyard");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Follow the Bodies"));
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
  });

  it("counted as the ability resolves: one put there in response counts", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Follow the Bodies"), { settle: false });
    destroy(game, bears);
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
  });

  it("with nothing put there, only the spell", () => {
    const { game } = table();
    lands(game, "Island", 3);
    cast(game, toHand(game, "Follow the Bodies"));
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("each copy may be aimed at another player", () => {
    const { game, a } = table({ players: 3 });
    const gone = spawn(game, "Grizzly Bears");
    destroy(game, gone);
    lands(game, "Swamp", 3);
    const bobsTop = toLibrary(game, "Island", B);
    const carolsTop = toLibrary(game, "Island", C);
    // The copy goes to Carol; the spell itself stays on Bob.
    a.chooseTargetsFn = (_view, _name, _specs, legal) =>
      legal.map((options) => options.find((o) => o.kind === "player" && o.player === C) ?? options[0] ?? null);
    let answered = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      answered += 1;
      return [eligible.includes(carolsTop) ? carolsTop : bobsTop];
    };
    cast(game, toHand(game, "Bitter Ordeal"), { targets: [ref(B)] });
    expect(answered).toBe(2);
    expect(zone(game, carolsTop)).toBe("exile");
    expect(zone(game, bobsTop)).toBe("exile");
  });
});
