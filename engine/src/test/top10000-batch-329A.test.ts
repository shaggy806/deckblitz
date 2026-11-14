/**
 * Batch 329, group A (EDHREC ranks 23455–30935): the clauses most likely to
 * be wrong in each card that is more than a stat line or an exact copy of an
 * already-tested pattern.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Take `card` whenever it may be chosen, and nothing else. */
const takeWhenOffered = (seat: ScriptedController, card: ObjectId): void => {
  seat.chooseFromZoneFn = (_view, eligible) => (eligible.includes(card) ? [card] : []);
};

describe("Bison Whistle", () => {
  it("a Bison creature on top may go onto the battlefield", () => {
    const { game, a } = table();
    const whistle = spawn(game, "Bison Whistle");
    lands(game, "Wastes", 1);
    const appa = toLibrary(game, "Appa, the Vigilant");
    takeWhenOffered(a, appa);
    activate(game, whistle);
    expect(zone(game, appa)).toBe("battlefield");
  });

  it("a creature that isn't a Bison is offered only for the hand", () => {
    const { game, a } = table();
    const whistle = spawn(game, "Bison Whistle");
    lands(game, "Wastes", 1);
    const bears = toLibrary(game, "Grizzly Bears");
    takeWhenOffered(a, bears);
    activate(game, whistle);
    expect(zone(game, bears)).toBe("hand");
  });

  it("a noncreature card may go to the graveyard, or stay on top", () => {
    const { game, a } = table();
    const whistle = spawn(game, "Bison Whistle");
    lands(game, "Wastes", 2);
    const forest = toLibrary(game, "Forest");
    a.chooseFromZoneFn = () => [];
    activate(game, whistle);
    expect(zone(game, forest)).toBe("library");
    game.state.objects[whistle].tapped = false;
    takeWhenOffered(a, forest);
    activate(game, whistle);
    expect(zone(game, forest)).toBe("graveyard");
  });
});

describe("Elderwood Scion", () => {
  it("a spell its controller casts targeting it costs {2} less", () => {
    const { game } = table();
    const scion = spawn(game, "Elderwood Scion");
    lands(game, "Forest", 2);
    const before = pt(game, scion).power;
    cast(game, toHand(game, "Titanic Growth"), { targets: [ref(scion)] });
    expect(pt(game, scion).power).toBe(before + 4);
  });
});

describe("Turtle Tracks", () => {
  it("each target player who agrees puts a basic land onto the battlefield", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 3);
    const mine = game.state.zones.perPlayer[A].library[0];
    const theirs = game.state.zones.perPlayer[B].library[0];
    pickModes(a, 0);
    pickModes(b, 0);
    takeWhenOffered(a, mine);
    takeWhenOffered(b, theirs);
    cast(game, toHand(game, "Turtle Tracks"), { targets: [ref(A), ref(B)] });
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[mine].controller).toBe(A);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(B);
  });
});

describe("Donatello's Science Lesson", () => {
  it("taps two creatures and two players each draw", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    const card = toHand(game, "Donatello's Science Lesson");
    const mine = hand(game, A).length - 1;
    const theirs = hand(game, B).length;
    cast(game, card, { targets: [ref(one), ref(two), ref(A), ref(B)] });
    expect(game.state.objects[one].tapped).toBe(true);
    expect(game.state.objects[two].tapped).toBe(true);
    expect(hand(game, A).length).toBe(mine + 1);
    expect(hand(game, B).length).toBe(theirs + 1);
  });
});

describe("Down for Repairs", () => {
  it("discards a nonland card and destroys that player's Attraction into their junkyard", () => {
    const { game } = table();
    const balloon = spawn(game, "Balloon Stand", B);
    const bears = toHand(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Down for Repairs"), { targets: [ref(B), ref(balloon)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, balloon)).not.toBe("battlefield");
    expect(game.state.players[B].junkyard ?? []).toContain(balloon);
  });

  it("can't target an Attraction another player controls", () => {
    const { game } = table();
    const booth = spawn(game, "Information Booth", A);
    lands(game, "Swamp", 3);
    expect(() => cast(game, toHand(game, "Down for Repairs"), { targets: [ref(B), ref(booth)] })).toThrow(/target/i);
  });
});

describe("Journey for the Elixir", () => {
  it("finds a basic land card in the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const forest = toGraveyard(game, "Forest");
    takeWhenOffered(a, forest);
    cast(game, toHand(game, "Journey for the Elixir"));
    expect(zone(game, forest)).toBe("hand");
  });
});

describe("Rhythmic Water Vortex", () => {
  it("bounces a creature and finds Mu Yanling in the graveyard", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    const mu = toGraveyard(game, "Mu Yanling");
    pickModes(a, 2);
    takeWhenOffered(a, mu);
    cast(game, toHand(game, "Rhythmic Water Vortex"), { targets: [ref(bears), null] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, mu)).toBe("hand");
  });
});

describe("Beast Hunt", () => {
  it("puts every creature card of the top three into the hand, the rest into the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const one = toLibrary(game, "Grizzly Bears");
    const land = toLibrary(game, "Forest");
    const two = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    cast(game, toHand(game, "Beast Hunt"));
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
    expect(zone(game, land)).toBe("graveyard");
  });
});

describe("Foe-liage", () => {
  it("grows when a land enters during its controller's turn, not an opponent's", () => {
    const { game } = table();
    const foe = spawn(game, "Foe-liage");
    enter(game, "Forest", B);
    expect(counters(game, foe)).toBe(1);
    nextTurn(game);
    enter(game, "Forest", B);
    expect(counters(game, foe)).toBe(1);
  });
});

describe("Pipsqueak, Rebel Strongarm", () => {
  it("can't attack alone without a +1/+1 counter, can with one", () => {
    const { game, a } = table();
    const pip = spawn(game, "Pipsqueak, Rebel Strongarm");
    attack(game, a, [pip]);
    expect(life(game, B)).toBe(20);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Leo's Guidance"), { targets: [ref(pip), null, null] });
    expect(counters(game, pip)).toBe(1);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [pip]);
    expect(life(game, B)).toBe(15);
  });
});

describe("Leo's Guidance", () => {
  it("puts a counter on each target and untaps them", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears", A, { tapped: true });
    const two = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Leo's Guidance"), { targets: [ref(one), ref(two), null] });
    expect([counters(game, one), counters(game, two)]).toEqual([1, 1]);
    expect(game.state.objects[one].tapped).toBe(false);
    expect(game.state.objects[two].tapped).toBe(false);
  });
});

describe("Wooden Cane", () => {
  it("makes a Mutant and attaches itself to it", () => {
    const { game } = table();
    const cane = enter(game, "Wooden Cane");
    expect(tokensNamed(game, "Mutant Token", A)).toBe(1);
    const mutant = named(game, "Mutant Token", A)[0];
    expect(game.state.objects[cane].attachedTo).toBe(mutant);
    expect(pt(game, mutant)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Air Nomad Student", () => {
  it("gets a counter at its controller's end step only if it didn't attack", () => {
    const { game, a } = table();
    const student = spawn(game, "Air Nomad Student");
    toStep(game, "end");
    settle(game);
    expect(counters(game, student)).toBe(1);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [student]);
    toStep(game, "end");
    settle(game);
    expect(counters(game, student)).toBe(1);
  });
});

describe("Rampaging Classmate", () => {
  it("gets +1/+0 for each other attacking creature", () => {
    const { game, a } = table();
    const classmate = spawn(game, "Rampaging Classmate");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [classmate, bears]);
    expect(life(game, B)).toBe(20 - 4 - 2);
  });
});

describe("Raph's Bravado", () => {
  it("gives attacking creatures +1/+0 during its controller's turn", () => {
    const { game, a } = table();
    spawn(game, "Raph's Bravado");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20 - 3);
  });
});
