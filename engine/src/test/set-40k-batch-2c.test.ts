/**
 * The set walk: Warhammer 40,000 Commander (40K), the bottom half, group c —
 * one test per card for what it does that's its own, and the edges its
 * rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  enter,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
  blockOffer,
  controller,
} from "./harness.js";

type Cast = Extract<Action, { type: "cast-spell" }>;

/** Make a Vehicle a creature for the turn, as crewing it would. */
const animate = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(
    A,
    { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
    [ref(id)],
  );
};

describe("Arco-Flagellant", () => {
  it("squad makes a copy per payment; none of them can block; paying 3 life makes one indestructible", () => {
    const { game, b } = table();
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Arco-Flagellant"), { kicked: true, kickCount: 1 });
    const flagellants = named(game, "Arco-Flagellant", A);
    expect(flagellants).toHaveLength(2);
    const [first] = flagellants;
    activate(game, first);
    expect(life(game, A)).toBe(17);
    expect(keywords(game, first).has("indestructible")).toBe(true);
    // On bob's turn, his attacker can't be blocked by either.
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    const offer = blockOffer(game, b, [bears], A);
    const blockers = offer.eligible.filter((e) => e.canBlock.length > 0).map((e) => e.blocker);
    expect(blockers).toContain(mine);
    for (const f of flagellants) expect(blockers).not.toContain(f);
  });
});

describe("The Swarmlord", () => {
  it("enters with two +1/+1 counters for each time you've cast your commander from the command zone", () => {
    const { game } = table();
    game.state.players[A].commanderCastCounts = { someCommander: 2 };
    const swarmlord = enter(game, "The Swarmlord");
    expect(counters(game, swarmlord)).toBe(4);
  });

  it("draws when a creature you control with any kind of counter dies — not one without, not an opponent's", () => {
    const { game } = table();
    spawn(game, "The Swarmlord");
    const marked = spawn(game, "Hill Giant");
    game.state.objects[marked].counters["-1/-1"] = 1;
    const plain = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters["+1/+1"] = 1;
    const before = hand(game, A).length;
    destroy(game, plain);
    destroy(game, theirs);
    expect(hand(game, A).length).toBe(before);
    destroy(game, marked);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Goliath Truck", () => {
  it("attacking puts two +1/+1 counters on another target attacking creature — never itself, nor one at home", () => {
    const { game, a } = table();
    const truck = spawn(game, "Goliath Truck");
    animate(game, truck);
    const left = spawn(game, "Grizzly Bears");
    const right = spawn(game, "Hill Giant");
    const home = spawn(game, "Memnite");
    const seen = watchTargets(a, (offered) => offered.map(() => right));
    attack(game, a, [truck, left, right]);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([left, right].sort());
    expect(seen.offered[0]).not.toContain(home);
    expect(counters(game, right)).toBe(2);
    expect(counters(game, left)).toBe(0);
  });

  it("has crew 2", () => {
    const { game } = table();
    const truck = spawn(game, "Goliath Truck");
    spawn(game, "Grizzly Bears");
    activate(game, truck, 0);
    expect(types(game, truck)).toContain("creature");
  });
});

describe("Epistolary Librarian", () => {
  it("attacking offers a free cast of a spell with mana value up to the number of attacking creatures", () => {
    const { game, a } = table();
    const librarian = spawn(game, "Epistolary Librarian");
    const bears = spawn(game, "Grizzly Bears");
    const two = toHand(game, "Grizzly Bears");
    const three = toHand(game, "Divination");
    let offered: readonly string[] = [];
    a.chooseCastNowFn = (_v, offer): Cast | null => {
      offered = offer.cards;
      return { type: "cast-spell", player: A, card: two, targets: [], via: "effect", free: true };
    };
    attack(game, a, [librarian, bears]);
    expect(offered).toContain(two);
    expect(offered).not.toContain(three);
    expect(zone(game, two)).toBe("battlefield");
  });
});

describe("Lychguard", () => {
  it("returns every legendary creature card from your graveyard to your hand, and only those", () => {
    const { game } = table();
    const guard = spawn(game, "Lychguard");
    lands(game, "Swamp", 4);
    const legend = toGraveyard(game, "Lucius the Eternal");
    const legend2 = toGraveyard(game, "The Swarmlord");
    const plain = toGraveyard(game, "Grizzly Bears");
    activate(game, guard, 0);
    expect(zone(game, guard)).toBe("graveyard");
    expect(zone(game, legend)).toBe("hand");
    expect(zone(game, legend2)).toBe("hand");
    expect(zone(game, plain)).toBe("graveyard");
  });
});

describe("Acolyte Hybrid", () => {
  it("destroys up to one target artifact as it attacks, and that artifact's controller draws", () => {
    const { game, a } = table();
    const hybrid = spawn(game, "Acolyte Hybrid");
    const relic = spawn(game, "Mind Stone", B);
    pickTargets(a, relic);
    const before = hand(game, B).length;
    const mine = hand(game, A).length;
    attack(game, a, [hybrid]);
    expect(zone(game, relic)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before + 1);
    expect(hand(game, A).length).toBe(mine);
  });

  it("an indestructible artifact isn't destroyed, and nobody draws (the ruling)", () => {
    const { game, a } = table();
    const hybrid = spawn(game, "Acolyte Hybrid");
    const relic = spawn(game, "Darksteel Relic", B);
    pickTargets(a, relic);
    const before = hand(game, B).length;
    attack(game, a, [hybrid]);
    expect(zone(game, relic)).toBe("battlefield");
    expect(hand(game, B).length).toBe(before);
  });
});

describe("Tyranid Harridan", () => {
  it("it or another Tyranid you control connecting makes a Tyranid Gargoyle; another non-Tyranid doesn't", () => {
    const { game, a } = table();
    const harridan = spawn(game, "Tyranid Harridan");
    const lictor = spawn(game, "Lictor");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [harridan, lictor, bears]);
    expect(tokensNamed(game, "Tyranid Gargoyle Token", A)).toBe(2);
    const [token] = named(game, "Tyranid Gargoyle Token", A);
    expect(keywords(game, token).has("flying")).toBe(true);
    expect(subtypes(game, token)).toEqual(expect.arrayContaining(["Tyranid", "Gargoyle"]));
  });

  it("has ward {4}", () => {
    const { game } = table();
    const harridan = spawn(game, "Tyranid Harridan");
    lands(game, "Mountain", 1, B);
    nextTurn(game);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(harridan)] });
    expect(zone(game, harridan)).toBe("battlefield");
  });
});

describe("Tzaangor Shaman", () => {
  it("after it connects, the next instant or sorcery you cast this turn is copied", () => {
    const { game, a } = table();
    const shaman = spawn(game, "Tzaangor Shaman");
    attack(game, a, [shaman]);
    expect(life(game, B)).toBe(17);
    lands(game, "Mountain", 1);
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(11);
  });
});

describe("Genestealer Patriarch", () => {
  it("puts an infection counter on a creature defending player controls; when it dies you get a Tyranid copy", () => {
    const { game, a } = table();
    const patriarch = spawn(game, "Genestealer Patriarch");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [bears]);
    attack(game, a, [patriarch]);
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(counters(game, bears, "infection")).toBe(1);
    destroy(game, giant);
    expect(named(game, "Hill Giant", A)).toHaveLength(0);
    destroy(game, bears);
    const [copy] = named(game, "Grizzly Bears", A);
    expect(copy).toBeDefined();
    expect(game.state.objects[copy].isToken).toBe(true);
    expect(subtypes(game, copy)).toEqual(expect.arrayContaining(["Bear", "Tyranid"]));
    // The copy doesn't carry the counter.
    expect(counters(game, copy, "infection")).toBe(0);
  });

  it("copies a token that dies with an infection counter, as it last existed", () => {
    const { game } = table();
    spawn(game, "Genestealer Patriarch");
    game.debugApplyEffect(B, { kind: "create-token", token: "Tyranid Warrior Token", count: 1 }, []);
    settle(game);
    const [token] = named(game, "Tyranid Warrior Token", B);
    game.state.objects[token].counters.infection = 1;
    destroy(game, token);
    expect(tokensNamed(game, "Tyranid Warrior Token", A)).toBe(1);
  });
});

describe("Grey Knight Paragon", () => {
  const setUp = () => {
    const t = table();
    nextTurn(t.game);
    const demon = spawn(t.game, "Grinning Demon", B);
    const bears = spawn(t.game, "Grizzly Bears", B);
    t.b.declareAttackersFn = () => [demon, bears].map((attacker) => ({ attacker, defender: A }));
    t.game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    return { ...t, demon, bears };
  };

  it("exiles an attacking Demon instead of destroying it", () => {
    const { game, a, demon } = setUp();
    pickTargets(a, demon);
    enter(game, "Grey Knight Paragon");
    expect(zone(game, demon)).toBe("exile");
  });

  it("destroys an attacking non-Demon", () => {
    const { game, a, bears } = setUp();
    pickTargets(a, bears);
    enter(game, "Grey Knight Paragon");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Tyranid Invasion", () => {
  it("makes a 3/3 trampling Tyranid Warrior for each opponent", () => {
    const { game } = table({ players: 4 });
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Tyranid Invasion"));
    expect(tokensNamed(game, "Tyranid Warrior Token", A)).toBe(3);
    const [token] = named(game, "Tyranid Warrior Token", A);
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, token).has("trample")).toBe(true);
    expect(game.state.players[C]).toBeDefined();
    expect(game.state.players[D]).toBeDefined();
  });
});

describe("Gargoyle Flock", () => {
  it("makes a Gargoyle at your end step only if a creature entered under your control this turn", () => {
    const { game } = table();
    spawn(game, "Gargoyle Flock");
    enter(game, "Grizzly Bears", B);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Tyranid Gargoyle Token", A)).toBe(0);
    nextTurn(game);
    nextTurn(game);
    enter(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Tyranid Gargoyle Token", A)).toBe(1);
  });

  it("counts itself entering", () => {
    const { game } = table();
    enter(game, "Gargoyle Flock");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Tyranid Gargoyle Token", A)).toBe(1);
  });
});

describe("Lictor", () => {
  it("makes a Tyranid Warrior if a creature entered under an opponent's control this turn", () => {
    const { game } = table();
    enter(game, "Grizzly Bears");
    enter(game, "Lictor");
    expect(tokensNamed(game, "Tyranid Warrior Token", A)).toBe(0);
    enter(game, "Grizzly Bears", B);
    enter(game, "Lictor");
    expect(tokensNamed(game, "Tyranid Warrior Token", A)).toBe(1);
  });
});

describe("Sautekh Immortal", () => {
  it("enters with a +1/+1 counter for each creature that died this turn, whoever controlled it", () => {
    const { game } = table();
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Grizzly Bears", B));
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Sautekh Immortal"));
    const [immortal] = named(game, "Sautekh Immortal", A);
    expect(counters(game, immortal)).toBe(2);
  });
});

describe("The Flesh Is Weak", () => {
  it("creatures you control with counters become artifacts and escape the -1/-1; the rest shrink", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const relic = spawn(game, "Ornithopter", B);
    enter(game, "The Flesh Is Weak");
    expect(counters(game, bears)).toBe(1);
    expect(types(game, bears)).toContain("artifact");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, relic)).toEqual({ power: 0, toughness: 2 });
  });

  it("a 1-toughness nonartifact creature of yours dies before the counter comes (the ruling)", () => {
    const { game } = table();
    const goblin = spawn(game, "Raging Goblin");
    enter(game, "The Flesh Is Weak");
    expect(zone(game, goblin)).toBe("graveyard");
  });
});

describe("Lucius the Eternal", () => {
  it("dying exiles it until the chosen opponent's creature leaves, then it returns", () => {
    const { game, a } = table();
    const lucius = spawn(game, "Lucius the Eternal");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    destroy(game, lucius);
    expect(zone(game, lucius)).toBe("exile");
    destroy(game, giant);
    expect(zone(game, lucius)).toBe("exile");
    destroy(game, bears);
    expect(zone(game, lucius)).toBe("battlefield");
    expect(controller(game, lucius)).toBe(A);
  });

  it("stays in the graveyard if the target leaves before the ability resolves (the ruling)", () => {
    const { game, a } = table();
    const lucius = spawn(game, "Lucius the Eternal");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(lucius)]);
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, lucius)).toBe("graveyard");
  });
});

describe("Neyam Shai Murad", () => {
  it("the damaged player gets their card back and picks a permanent card from yours for you", () => {
    const { game, a, b } = table();
    const neyam = spawn(game, "Neyam Shai Murad");
    const theirs = toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Lightning Bolt", B);
    const mine1 = toGraveyard(game, "Grizzly Bears");
    const mine2 = toGraveyard(game, "Serra Angel");
    toGraveyard(game, "Divination");
    pickTargets(a, theirs);
    pickModes(a, 0);
    const picked = pickFromZone(b, mine1);
    attack(game, a, [neyam]);
    expect(zone(game, theirs)).toBe("hand");
    expect(hand(game, B)).toContain(theirs);
    expect([...picked.offered].sort()).toEqual([mine1, mine2].sort());
    expect(zone(game, mine1)).toBe("battlefield");
    expect(controller(game, mine1)).toBe(A);
    expect(zone(game, mine2)).toBe("graveyard");
    expect(graveyard(game, A)).not.toContain(mine1);
  });

  it("declining leaves both graveyards alone", () => {
    const { game, a } = table();
    const neyam = spawn(game, "Neyam Shai Murad");
    const theirs = toGraveyard(game, "Hill Giant", B);
    const mine = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, theirs);
    pickModes(a);
    attack(game, a, [neyam]);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });
});
