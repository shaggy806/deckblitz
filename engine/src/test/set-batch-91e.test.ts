/**
 * Set walk batch 91, part e (2026-10-16): Murders at Karlov Manor (MKM) and Murders at Karlov Manor Commander (MKC), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
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
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const isSuspected = (game: Game, id: ObjectId): boolean => game.state.objects[id].suspectedAt !== undefined;
const makeToken = (game: Game, name: string, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
  settle(game);
};
const tokensOf = (game: Game, name: string, player: PlayerId = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);
const suspect = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(game.state.objects[id].controller, { kind: "suspect", target: 0 }, [ref(id)]);
  settle(game);
};
const drawOne = (game: Game): void => {
  game.debugApplyEffect(A, { kind: "draw", amount: 1 });
  settle(game);
};
const faceDownCast = (game: Game, card: ObjectId): void => cast(game, card, { via: "face-down" });
const turnUp = (game: Game, permanent: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent, morph: true } as Action);
  settle(game);
};
const activateWithSacrifice = (
  game: Game,
  source: ObjectId,
  sacrifice: ObjectId,
  targets: readonly ObjectId[] = [],
): void => {
  game.dispatch({
    type: "activate-ability",
    player: A,
    source,
    abilityIndex: 0,
    targets: targets.map(ref),
    sacrifice,
  } as Action);
  settle(game);
};
const canActivateWithSacrifice = (game: Game, source: ObjectId, sacrifice: ObjectId, targets: readonly ObjectId[] = []): boolean =>
  game.canDispatch({
    type: "activate-ability",
    player: A,
    source,
    abilityIndex: 0,
    targets: targets.map(ref),
    sacrifice,
  } as Action) === null;
/** Attack with these and stop in the declare attackers step with alice's priority. */
const declareAttack = (game: Game, seat: ScriptedController, attackers: readonly ObjectId[]): void => {
  seat.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  game.advanceUntil(
    (s) =>
      s.turn.step === "declare-attackers" &&
      s.priority.holder === A &&
      s.awaiting === null &&
      s.pendingTriggers.length === 0 &&
      s.zones.shared.stack.length === 0,
  );
};

describe("Meddling Youths", () => {
  it("investigates when you attack with three or more creatures, not two", () => {
    const { game, a } = table();
    const youths = spawn(game, "Meddling Youths");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    attack(game, a, [youths, bears[0]]);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    attack(game, a, [youths, ...bears]);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Loxodon Eavesdropper", () => {
  it("investigates as it enters, and grows with vigilance on your second draw of the turn", () => {
    const { game } = table();
    const lox = enter(game, "Loxodon Eavesdropper");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(pt(game, lox)).toEqual({ power: 3, toughness: 3 });
    drawOne(game);
    expect(pt(game, lox)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, lox).has("vigilance")).toBe(true);
    drawOne(game);
    expect(pt(game, lox)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Inside Source", () => {
  it("makes a 2/2 Detective, and pumps a Detective you control at sorcery speed", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const source = toHand(game, "Inside Source");
    cast(game, source);
    const [detective] = tokensOf(game, "Detective Token");
    expect(pt(game, detective)).toEqual({ power: 2, toughness: 2 });
    game.state.objects[source].summoningSick = false;
    lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, source, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, source, 0, { targets: [ref(detective)] });
    expect(pt(game, detective)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, detective).has("vigilance")).toBe(true);
  });
});

describe("Undercover Crocodelf", () => {
  it("investigates when it deals combat damage to a player", () => {
    const { game, a } = table();
    const croc = spawn(game, "Undercover Crocodelf");
    attack(game, a, [croc]);
    expect(life(game, B)).toBe(15);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("is cast face down with disguise and turned up for {3}{G/U}{G/U}", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const croc = toHand(game, "Undercover Crocodelf");
    faceDownCast(game, croc);
    expect(game.state.objects[croc].faceDown?.kind).toBe("disguise");
    expect(pt(game, croc)).toEqual({ power: 2, toughness: 2 });
    lands(game, "Forest", 5);
    turnUp(game, croc);
    expect(pt(game, croc)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Clandestine Meddler", () => {
  it("suspects up to one other creature you control, and surveils when a suspected creature attacks", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Clandestine Meddler");
    const [meddler] = named(game, "Clandestine Meddler");
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(meddler);
    expect(isSuspected(game, bears)).toBe(true);
    const top = toLibrary(game, "Hill Giant");
    let surveilled: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      surveilled = cards;
      return [...cards];
    };
    attack(game, a, [bears]);
    expect(surveilled).toEqual([top]);
    expect(zone(game, top)).toBe("graveyard");
  });

  it("doesn't surveil when no suspected creature attacks", () => {
    const { game, a } = table();
    const meddler = spawn(game, "Clandestine Meddler");
    let asked = 0;
    a.chooseScryFn = () => {
      asked += 1;
      return [];
    };
    attack(game, a, [meddler]);
    expect(asked).toBe(0);
  });
});

describe("Fuss // Bother", () => {
  it("Fuss is an instant: a +1/+1 counter on each attacking creature you control", () => {
    const { game, a } = table();
    const attackers = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const home = spawn(game, "Hill Giant");
    lands(game, "Plains", 3);
    const card = toHand(game, "Fuss // Bother");
    declareAttack(game, a, attackers);
    cast(game, card, { face: 1 });
    expect(attackers.map((id) => counters(game, id))).toEqual([1, 1]);
    expect(counters(game, home)).toBe(0);
    expect(zone(game, card)).toBe("graveyard");
  });

  it("Bother makes three 1/1 flying Thopters and surveils 2; it's a sorcery", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const card = toHand(game, "Fuss // Bother");
    let surveilled = 0;
    a.chooseScryFn = (_view, cards) => {
      surveilled = cards.length;
      return [];
    };
    cast(game, card, { face: 2 });
    expect(tokensNamed(game, "Thopter Token", A)).toBe(3);
    expect(surveilled).toBe(2);
  });

  it("only Fuss is offered during combat", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 6);
    const card = toHand(game, "Fuss // Bother");
    declareAttack(game, a, [bears]);
    const faces = game
      .legalActions(A)
      .filter((o) => o.kind === "cast-spell" && o.card === card)
      .map((o) => (o.kind === "cast-spell" ? o.face : undefined));
    expect([...new Set(faces)]).toEqual([1]);
  });
});

describe("Granite Witness", () => {
  it("turned face up, may tap target creature", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const witness = toHand(game, "Granite Witness");
    faceDownCast(game, witness);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    pickTargets(a, theirs);
    pickModes(a, 0);
    turnUp(game, witness);
    expect(isTapped(game, theirs)).toBe(true);
    expect(keywords(game, witness).has("flying")).toBe(true);
  });

  it("may untap it instead", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const witness = toHand(game, "Granite Witness");
    faceDownCast(game, witness);
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Island", 2);
    pickTargets(a, mine);
    pickModes(a, 1);
    turnUp(game, witness);
    expect(isTapped(game, mine)).toBe(false);
  });
});

describe("Projektor Inspector", () => {
  it("loots as it enters, as another Detective enters, and as a Detective is turned face up", () => {
    const { game, a } = table();
    pickModes(a, 0);
    lands(game, "Island", 3);
    const inspector = toHand(game, "Projektor Inspector");
    cast(game, inspector);
    expect(graveyard(game)).toHaveLength(1);
    // Cast face down it's no Detective; turned face up it is.
    lands(game, "Wastes", 3);
    const croc = toHand(game, "Undercover Crocodelf");
    const handBefore = hand(game).length;
    faceDownCast(game, croc);
    expect(graveyard(game)).toHaveLength(1);
    lands(game, "Forest", 5);
    turnUp(game, croc);
    expect(graveyard(game)).toHaveLength(2);
    makeToken(game, "Detective Token");
    expect(graveyard(game)).toHaveLength(3);
    // A non-Detective entering doesn't.
    enter(game, "Grizzly Bears");
    expect(graveyard(game)).toHaveLength(3);
    // Two more draws and discards; the Crocodelf left the hand.
    expect(hand(game).length).toBe(handBefore - 1);
  });

  it("is a may: declining neither draws nor discards", () => {
    const { game, a } = table();
    pickModes(a);
    const handBefore = hand(game).length;
    enter(game, "Projektor Inspector");
    expect(hand(game).length).toBe(handBefore);
    expect(graveyard(game)).toHaveLength(0);
  });
});

describe("Perimeter Enforcer", () => {
  it("gets +1/+1 as another Detective enters and as a Detective is turned face up", () => {
    const { game } = table();
    const enforcer = spawn(game, "Perimeter Enforcer");
    lands(game, "Wastes", 3);
    const croc = toHand(game, "Undercover Crocodelf");
    faceDownCast(game, croc);
    expect(pt(game, enforcer)).toEqual({ power: 1, toughness: 1 });
    lands(game, "Forest", 5);
    turnUp(game, croc);
    expect(pt(game, enforcer)).toEqual({ power: 2, toughness: 2 });
    enter(game, "Grizzly Bears");
    expect(pt(game, enforcer)).toEqual({ power: 2, toughness: 2 });
    makeToken(game, "Detective Token");
    expect(pt(game, enforcer)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Alley Assailant", () => {
  it("enters tapped when cast face up", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const assailant = toHand(game, "Alley Assailant");
    cast(game, assailant);
    expect(zone(game, assailant)).toBe("battlefield");
    expect(isTapped(game, assailant)).toBe(true);
  });

  it("enters untapped face down; turned face up, drains the opponent for 3", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const assailant = toHand(game, "Alley Assailant");
    faceDownCast(game, assailant);
    expect(isTapped(game, assailant)).toBe(false);
    lands(game, "Swamp", 6);
    turnUp(game, assailant);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
    expect(isTapped(game, assailant)).toBe(false);
  });
});

describe("Deadly Complication", () => {
  it("both modes: destroys a creature, and counters a suspected creature you control which may stop being suspected", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears");
    suspect(game, bears);
    pickModes(a, 0);
    cast(game, toHand(game, "Deadly Complication"), { modes: [0, 1], targets: [ref(giant), ref(bears)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
    expect(isSuspected(game, bears)).toBe(false);
  });

  it("keeping it suspected is the caster's choice", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    suspect(game, bears);
    pickModes(a);
    cast(game, toHand(game, "Deadly Complication"), { modes: [1], targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(isSuspected(game, bears)).toBe(true);
  });

  it("the counter mode needs a suspected creature you control", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Deadly Complication");
    expect(() => cast(game, card, { modes: [1], targets: [ref(bears)] })).toThrow();
  });
});

describe("Person of Interest", () => {
  it("suspects itself and makes a Detective", () => {
    const { game } = table();
    const person = enter(game, "Person of Interest");
    expect(isSuspected(game, person)).toBe(true);
    expect(keywords(game, person).has("menace")).toBe(true);
    expect(tokensNamed(game, "Detective Token", A)).toBe(1);
  });
});

describe("Gadget Technician", () => {
  it("makes a Thopter as it enters face up", () => {
    const { game } = table();
    enter(game, "Gadget Technician");
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
  });

  it("makes none entering face down, and one as it's turned face up", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const tech = toHand(game, "Gadget Technician");
    faceDownCast(game, tech);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(0);
    lands(game, "Island", 2);
    turnUp(game, tech);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
  });
});

describe("Hotshot Investigators", () => {
  it("bounces a creature you controlled and investigates", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Hotshot Investigators");
    expect(zone(game, bears)).toBe("hand");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("bounces an opponent's creature without a Clue", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    enter(game, "Hotshot Investigators");
    expect(zone(game, theirs)).toBe("hand");
    expect(hand(game, B)).toContain(theirs);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });
});

describe("Benthic Criminologists", () => {
  it("may sacrifice an artifact to draw as it enters and as it attacks", () => {
    const { game, a } = table();
    makeToken(game, "Clue Token");
    makeToken(game, "Clue Token");
    const before = hand(game).length;
    a.chooseSacrificesFn = (_view, eligible) => [eligible[0]];
    pickModes(a, 0);
    enter(game, "Benthic Criminologists");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
    const [benthic] = named(game, "Benthic Criminologists");
    attack(game, a, [benthic]);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    expect(hand(game).length).toBe(before + 2);
  });

  it("declining draws nothing", () => {
    const { game, a } = table();
    makeToken(game, "Clue Token");
    const before = hand(game).length;
    a.chooseSacrificesFn = () => [];
    enter(game, "Benthic Criminologists");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(hand(game).length).toBe(before);
  });
});

describe("Marketwatch Phantom", () => {
  it("gains flying as another creature with power 2 or less enters", () => {
    const { game } = table();
    const phantom = spawn(game, "Marketwatch Phantom");
    enter(game, "Hill Giant");
    expect(keywords(game, phantom).has("flying")).toBe(false);
    enter(game, "Savannah Lions");
    expect(keywords(game, phantom).has("flying")).toBe(true);
  });

  it("not for an opponent's creature", () => {
    const { game } = table();
    const phantom = spawn(game, "Marketwatch Phantom");
    enter(game, "Savannah Lions", B);
    expect(keywords(game, phantom).has("flying")).toBe(false);
  });
});

describe("Repeat Offender", () => {
  it("suspects itself, then grows while it's suspected", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const offender = spawn(game, "Repeat Offender");
    activate(game, offender);
    expect(isSuspected(game, offender)).toBe(true);
    expect(counters(game, offender)).toBe(0);
    activate(game, offender);
    expect(counters(game, offender)).toBe(1);
    expect(isSuspected(game, offender)).toBe(true);
  });
});

describe("Agency Coroner", () => {
  it("draws two for a suspected creature, one for any other, and can't sacrifice itself", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const coroner = spawn(game, "Agency Coroner");
    const suspectBears = spawn(game, "Grizzly Bears");
    const plainBears = spawn(game, "Grizzly Bears");
    suspect(game, suspectBears);
    expect(canActivateWithSacrifice(game, coroner, coroner)).toBe(false);
    const before = hand(game).length;
    activateWithSacrifice(game, coroner, suspectBears);
    expect(hand(game).length).toBe(before + 2);
    activateWithSacrifice(game, coroner, plainBears);
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Furtive Courier", () => {
  it("can be blocked until you've sacrificed an artifact this turn", () => {
    const { game, a } = table();
    const courier = spawn(game, "Furtive Courier");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    const offer = blockOffer(game, a, [courier, bears]);
    expect(offer.eligible.find((e) => e.blocker === wall)?.canBlock ?? []).toContain(courier);
  });

  it("can't be blocked once a Clue token was sacrificed", () => {
    const { game, a } = table();
    const courier = spawn(game, "Furtive Courier");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    makeToken(game, "Clue Token");
    lands(game, "Wastes", 2);
    activate(game, tokensOf(game, "Clue Token")[0]);
    const offer = blockOffer(game, a, [courier, bears]);
    const canBlock = offer.eligible.find((e) => e.blocker === wall)?.canBlock ?? [];
    expect(canBlock).not.toContain(courier);
    expect(canBlock).toContain(bears);
  });

  it("loots as it attacks", () => {
    const { game, a } = table();
    const courier = spawn(game, "Furtive Courier");
    const before = hand(game).length;
    attack(game, a, [courier]);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Rubblebelt Braggart", () => {
  it("may suspect itself as it attacks", () => {
    const { game, a } = table();
    const braggart = spawn(game, "Rubblebelt Braggart");
    pickModes(a, 0);
    attack(game, a, [braggart]);
    expect(isSuspected(game, braggart)).toBe(true);
  });

  it("doesn't trigger while it's already suspected", () => {
    const { game, a } = table();
    const braggart = spawn(game, "Rubblebelt Braggart");
    suspect(game, braggart);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    attack(game, a, [braggart]);
    expect(asked).toBe(0);
  });
});

describe("Offender at Large", () => {
  it("gives up to one target creature +2/+0 as it enters, and again as it's turned face up", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Offender at Large"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    lands(game, "Wastes", 3);
    const second = toHand(game, "Offender at Large");
    faceDownCast(game, second);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    lands(game, "Mountain", 5);
    turnUp(game, second);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 2 });
  });
});

describe("Curious Cadaver", () => {
  it("returns from your graveyard to your hand when you sacrifice a Clue", () => {
    const { game } = table();
    const cadaver = toGraveyard(game, "Curious Cadaver");
    makeToken(game, "Clue Token");
    lands(game, "Wastes", 2);
    activate(game, tokensOf(game, "Clue Token")[0]);
    expect(zone(game, cadaver)).toBe("hand");
  });

  it("not for an opponent's Clue", () => {
    const { game } = table();
    const cadaver = toGraveyard(game, "Curious Cadaver");
    makeToken(game, "Clue Token", B);
    game.debugApplyEffect(B, { kind: "sacrifice", who: "you", filter: { subtype: "Clue" }, count: 1 });
    // The edict's choice is queued for the next fixpoint; run until it's done.
    game.advanceUntil((s) => s.pendingSacrifices.length === 0 && s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(tokensNamed(game, "Clue Token", B)).toBe(0);
    expect(zone(game, cadaver)).toBe("graveyard");
  });
});

describe("Nightdrinker Moroii", () => {
  it("you lose 3 life as it enters face up, not when it's turned face up", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Nightdrinker Moroii"));
    expect(life(game)).toBe(17);
    lands(game, "Wastes", 3);
    const second = toHand(game, "Nightdrinker Moroii");
    faceDownCast(game, second);
    lands(game, "Swamp", 2);
    turnUp(game, second);
    expect(life(game)).toBe(17);
    expect(keywords(game, second).has("flying")).toBe(true);
  });
});

describe("Museum Nightwatch", () => {
  it("makes a Detective when it dies face up, none when it dies face down", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const hidden = toHand(game, "Museum Nightwatch");
    faceDownCast(game, hidden);
    destroy(game, hidden);
    expect(zone(game, hidden)).toBe("graveyard");
    expect(tokensNamed(game, "Detective Token", A)).toBe(0);
    const watch = spawn(game, "Museum Nightwatch");
    destroy(game, watch);
    expect(tokensNamed(game, "Detective Token", A)).toBe(1);
  });
});

describe("Seasoned Consultant", () => {
  it("gets +2/+0 when you attack with three or more creatures", () => {
    const { game, a } = table();
    const consultant = spawn(game, "Seasoned Consultant");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    attack(game, a, [consultant, bears[0]]);
    expect(pt(game, consultant)).toEqual({ power: 1, toughness: 3 });
    attack(game, a, [consultant, ...bears]);
    expect(pt(game, consultant)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Absolving Lammasu", () => {
  it("as it enters, every suspected creature is no longer suspected", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    suspect(game, mine);
    suspect(game, theirs);
    enter(game, "Absolving Lammasu");
    expect(isSuspected(game, mine)).toBe(false);
    expect(isSuspected(game, theirs)).toBe(false);
  });

  it("dying, gains 3 life and suspects up to one creature an opponent controls", () => {
    const { game, a } = table();
    const lammasu = spawn(game, "Absolving Lammasu");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [theirs]);
    destroy(game, lammasu);
    expect(seen.offered[0]).toContain(theirs);
    expect(seen.offered[0]).not.toContain(mine);
    expect(isSuspected(game, theirs)).toBe(true);
    expect(life(game)).toBe(23);
  });

  it("gains the life with no target chosen", () => {
    const { game } = table();
    const lammasu = spawn(game, "Absolving Lammasu");
    destroy(game, lammasu);
    expect(life(game)).toBe(23);
  });
});

describe("Shady Informant", () => {
  it("deals 2 damage to any target as it dies", () => {
    const { game, a } = table();
    const informant = spawn(game, "Shady Informant");
    pickTargets(a, B);
    destroy(game, informant);
    expect(life(game, B)).toBe(18);
  });
});

describe("Cornered Crook", () => {
  it("sacrificing an artifact as it enters deals 3 damage to any target", () => {
    const { game, a } = table();
    makeToken(game, "Clue Token");
    a.chooseSacrificesFn = (_view, eligible) => [eligible[0]];
    pickModes(a, 0);
    pickTargets(a, B);
    enter(game, "Cornered Crook");
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    expect(life(game, B)).toBe(17);
  });

  it("declining deals nothing", () => {
    const { game, a } = table();
    makeToken(game, "Clue Token");
    a.chooseSacrificesFn = () => [];
    enter(game, "Cornered Crook");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(life(game, B)).toBe(20);
  });
});

describe("Rune-Brand Juggler", () => {
  it("suspects itself, then sacrifices itself for -5/-5", () => {
    const { game, a } = table();
    const juggler = toHand(game, "Rune-Brand Juggler");
    const seen = watchTargets(a, () => [juggler]);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    cast(game, juggler);
    expect(seen.offered[0]).toContain(juggler);
    expect(isSuspected(game, juggler)).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 3);
    // Only a suspected creature pays the cost.
    expect(canActivateWithSacrifice(game, juggler, bears, [giant])).toBe(false);
    activateWithSacrifice(game, juggler, juggler, [giant]);
    expect(zone(game, juggler)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Defenestrated Phantom", () => {
  it("is a 2/2 face down and a 4/3 flier turned face up for {4}{W}", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const phantom = toHand(game, "Defenestrated Phantom");
    faceDownCast(game, phantom);
    expect(pt(game, phantom)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, phantom).has("flying")).toBe(false);
    lands(game, "Plains", 5);
    turnUp(game, phantom);
    expect(pt(game, phantom)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, phantom).has("flying")).toBe(true);
  });
});

describe("Pompous Gadabout", () => {
  it("has hexproof during your turn only", () => {
    const { game } = table();
    const gadabout = spawn(game, "Pompous Gadabout");
    expect(keywords(game, gadabout).has("hexproof")).toBe(true);
    nextTurn(game);
    expect(keywords(game, gadabout).has("hexproof")).toBe(false);
  });

  it("can't be blocked by a face-down creature", () => {
    const { game, a } = table();
    const gadabout = spawn(game, "Pompous Gadabout");
    const bears = spawn(game, "Grizzly Bears");
    const named2 = spawn(game, "Grizzly Bears", B);
    const hidden = spawn(game, "Grizzly Bears", B);
    game.state.objects[hidden].faceDown = { kind: "disguise" };
    const offer = blockOffer(game, a, [gadabout, bears]);
    const hiddenCan = offer.eligible.find((e) => e.blocker === hidden)?.canBlock ?? [];
    expect(hiddenCan).not.toContain(gadabout);
    expect(hiddenCan).toContain(bears);
    expect(offer.eligible.find((e) => e.blocker === named2)?.canBlock ?? []).toContain(gadabout);
  });
});
