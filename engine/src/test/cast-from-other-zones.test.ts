/**
 * A permission to cast a card from a zone other than your hand (rule 601.3):
 * another player's hand during a resolution (Silent-Blade Oni, Mindleech Mass,
 * Mindclaw Shaman) or for a turn (Sen Triplets), into play from one (Zara), its
 * own exile (Misthollow Griffin, Eternal Scourge), a linked exile (Idol of
 * Endurance, Planeswalker's Mischief), and the library while searching it
 * (Panglacial Wurm).
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { viewFor } from "../view.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

type Cast = Extract<Action, { type: "cast-spell" }>;
type CastNowOffer = Extract<LegalAction, { kind: "cast-now" }>;

/** Alice's next precombat main, every turn between played out. */
const aliceAgain = (game: Game): void => {
  nextTurn(game);
  toStep(game, "precombat-main", A);
};

/** Nothing but what the test puts there: the pick at random can't miss. */
const emptyHand = (game: Game, player: PlayerId): void => {
  for (const id of [...hand(game, player)]) game.debugMove(id, "library");
};

const castsOf = (actions: readonly LegalAction[], card: ObjectId) =>
  actions.filter((a) => a.kind === "cast-spell" && a.card === card);

describe("cast-now from another player's hand", () => {
  it("Silent-Blade Oni: looks at the whole hand, casts a spell from it free; the caster controls it, its owner keeps it", () => {
    const { game, a, b } = table();
    const oni = spawn(game, "Silent-Blade Oni", A);
    const divination = toHand(game, "Divination", B);
    const land = toHand(game, "Island", B);
    let offer: CastNowOffer | undefined;
    a.chooseCastNowFn = (_v, o): Cast => {
      offer = o;
      return { type: "cast-spell", player: A, card: divination, targets: [], via: "effect", free: true };
    };
    b.declareBlockersFn = () => [];
    const before = hand(game, A).length;
    attack(game, a, [oni]);
    expect(offer?.looked).toEqual(expect.arrayContaining([divination, land]));
    expect(offer?.cards).toContain(divination);
    expect(offer?.casts.every((c) => c.card !== land)).toBe(true);
    // Divination's two cards are Alice's, and it goes to Bob's graveyard.
    expect(hand(game, A).length).toBe(before + 2);
    expect(zone(game, divination)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(divination);
  });

  it("shows the hand it looks at to the looker alone", () => {
    const { game, a, b } = table({ players: 3 });
    const oni = spawn(game, "Silent-Blade Oni", A);
    const secret = toHand(game, "Divination", B);
    b.declareBlockersFn = () => [];
    let seenByAlice = false;
    let seenByCarol = true;
    a.chooseCastNowFn = () => {
      seenByAlice = viewFor(game.state, registryOf(game), A).objects[secret] !== undefined;
      seenByCarol = viewFor(game.state, registryOf(game), C).objects[secret] !== undefined;
      return null;
    };
    attack(game, a, [oni]);
    expect(seenByAlice).toBe(true);
    expect(seenByCarol).toBe(false);
    expect(zone(game, secret)).toBe("hand");
  });

  it("Silent-Blade Oni: with nothing castable the hand is still looked at", () => {
    const { game, a, b } = table();
    const oni = spawn(game, "Silent-Blade Oni", A);
    const land = toHand(game, "Island", B);
    b.declareBlockersFn = () => [];
    const look = pickFromZone(a);
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    attack(game, a, [oni]);
    expect(asked).toBe(false);
    expect(look.offered).toEqual([]);
    expect(zone(game, land)).toBe("hand");
  });

  it("Mindleech Mass: declining the look offers nothing", () => {
    const { game, a, b } = table();
    const mass = spawn(game, "Mindleech Mass", A);
    toHand(game, "Divination", B);
    b.declareBlockersFn = () => [];
    pickModes(a);
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    attack(game, a, [mass]);
    expect(asked).toBe(false);
  });

  it("Mindleech Mass: the look taken, a spell is cast from the hand", () => {
    const { game, a, b } = table();
    const mass = spawn(game, "Mindleech Mass", A);
    const divination = toHand(game, "Divination", B);
    b.declareBlockersFn = () => [];
    pickModes(a, 0);
    a.chooseCastNowFn = (): Cast => ({ type: "cast-spell", player: A, card: divination, targets: [], via: "effect", free: true });
    attack(game, a, [mass]);
    expect(zone(game, divination)).toBe("graveyard");
  });

  it("Mindclaw Shaman: only an instant or sorcery is offered; a creature stays", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    const bear = toHand(game, "Grizzly Bears", B);
    pickTargets(a, B);
    let offer: CastNowOffer | undefined;
    a.chooseCastNowFn = (_v, o): Cast => {
      offer = o;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect", free: true };
    };
    enter(game, "Mindclaw Shaman", A);
    settle(game);
    expect(offer?.cards).toEqual([bolt]);
    expect(offer?.looked).toEqual(expect.arrayContaining([bolt, bear]));
    expect(life(game, B)).toBe(17);
    expect(zone(game, bear)).toBe("hand");
    expect(graveyard(game, B)).toContain(bolt);
  });
});

describe("Sen Triplets — playing from another player's hand for a turn", () => {
  /** Sen Triplets on Alice's side, her upkeep's trigger resolved on Bob. */
  const senInMain = (players: 2 | 3 = 2) => {
    const t = table({ players });
    const sen = spawn(t.game, "Sen Triplets", A);
    pickTargets(t.a, B);
    aliceAgain(t.game);
    return { ...t, sen };
  };

  it("the target can't cast or activate, and their hand is shown to every player", () => {
    const { game } = senInMain(3);
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1, B);
    expect(viewFor(game.state, registryOf(game), C).objects[bolt]).toBeDefined();
    expect(viewFor(game.state, registryOf(game), A).objects[bolt]).toBeDefined();
    // Bob, given priority, has neither a spell nor a mana ability to use (the
    // rulings: mana abilities included).
    lands(game, "Island", 3, A);
    cast(game, toHand(game, "Divination", A), { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.priority.holder).toBe(B);
    expect(game.legalActions(B).map((a) => a.kind)).toEqual(["pass-priority"]);
  });

  it("Alice casts a spell from Bob's hand with her own mana, at her own timing, and it goes to Bob's graveyard", () => {
    const { game } = senInMain();
    const divination = toHand(game, "Divination", B);
    const mine = hand(game, A).length;
    expect(castsOf(game.legalActions(A), divination)).toHaveLength(0); // no mana yet
    lands(game, "Island", 3, A);
    const offers = castsOf(game.legalActions(A), divination);
    expect(offers).toHaveLength(1);
    expect((offers[0] as { via?: string }).via).toBe("other-hand");
    cast(game, divination, { via: "other-hand" });
    expect(hand(game, A).length).toBe(mine + 2);
    expect(graveyard(game, B)).toContain(divination);
  });

  it("a permanent cast that way is Alice's to control and Bob's to own", () => {
    const { game } = senInMain();
    const bear = toHand(game, "Grizzly Bears", B);
    lands(game, "Forest", 2, A);
    cast(game, bear, { via: "other-hand" });
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].controller).toBe(A);
    expect(game.state.objects[bear].owner).toBe(B);
  });

  it("a land from that hand uses her land drop, under her control", () => {
    const { game } = senInMain();
    const land = toHand(game, "Forest", B);
    const offered = game.legalActions(A).some((a) => a.kind === "play-land" && a.card === land);
    expect(offered).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: land });
    settle(game);
    expect(zone(game, land)).toBe("battlefield");
    expect(game.state.objects[land].controller).toBe(A);
    expect(game.state.players[A].landsPlayedThisTurn).toBe(1);
  });

  it("keeps the card's timing: no sorcery during combat", () => {
    const { game } = senInMain();
    const divination = toHand(game, "Divination", B);
    lands(game, "Island", 3, A);
    toStep(game, "begin-combat", A);
    expect(castsOf(game.legalActions(A), divination)).toHaveLength(0);
  });

  it("another opponent's hand isn't opened, and the permission and the reveal end with the turn", () => {
    const { game } = senInMain(3);
    const carols = toHand(game, "Divination", C);
    const bobs = toHand(game, "Divination", B);
    lands(game, "Island", 3, A);
    expect(castsOf(game.legalActions(A), carols)).toHaveLength(0);
    expect(castsOf(game.legalActions(A), bobs)).toHaveLength(1);
    nextTurn(game);
    expect(castsOf(game.legalActions(A), bobs)).toHaveLength(0);
    expect(viewFor(game.state, registryOf(game), C).objects[bobs]).toBeUndefined();
  });
});

describe("Zara, Renegade Recruiter — onto the battlefield from another player's hand", () => {
  it("puts a creature from defending player's hand attacking under Alice's control, back to its owner's hand at the end step", () => {
    const { game, a, b } = table();
    const zara = spawn(game, "Zara, Renegade Recruiter", A);
    const bear = toHand(game, "Grizzly Bears", B);
    const land = toHand(game, "Island", B);
    const pick = pickFromZone(a, bear);
    b.declareBlockersFn = () => [];
    const before = life(game, B);
    attack(game, a, [zara]);
    expect(pick.offered).toEqual([bear]);
    expect(game.state.objects[bear].controller).toBe(A);
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(life(game, B)).toBe(before - 6);
    expect(zone(game, land)).toBe("hand");
    nextTurn(game);
    expect(zone(game, bear)).toBe("hand");
    expect(hand(game, B)).toContain(bear);
  });
});

describe("Zara with no creature to take", () => {
  it("still looks at the hand", () => {
    const { game, a, b } = table();
    const zara = spawn(game, "Zara, Renegade Recruiter", A);
    const land = toHand(game, "Island", B);
    let looked = false;
    a.chooseFromZoneFn = (_v, eligible) => {
      looked = true;
      expect(eligible).toEqual([]);
      return [];
    };
    b.declareBlockersFn = () => [];
    attack(game, a, [zara]);
    expect(looked).toBe(true);
    expect(zone(game, land)).toBe("hand");
  });
});

describe("You may cast this card from exile", () => {
  it("Misthollow Griffin: its owner casts it from exile for its cost", () => {
    const { game } = table();
    const griffin = toExile(game, "Misthollow Griffin", A);
    expect(castsOf(game.legalActions(A), griffin)).toHaveLength(0);
    lands(game, "Island", 4, A);
    expect(castsOf(game.legalActions(A), griffin)).toHaveLength(1);
    cast(game, griffin, { via: "impulse" });
    expect(zone(game, griffin)).toBe("battlefield");
  });

  it("isn't offered to anyone but its owner, nor outside sorcery timing", () => {
    const { game } = table();
    const griffin = toExile(game, "Misthollow Griffin", B);
    lands(game, "Island", 4, A);
    expect(castsOf(game.legalActions(A), griffin)).toHaveLength(0);
    const mine = toExile(game, "Misthollow Griffin", A);
    toStep(game, "begin-combat", A);
    expect(castsOf(game.legalActions(A), mine)).toHaveLength(0);
  });

  it("Eternal Scourge: exiled by an opponent's targeting, and castable from there again", () => {
    const { game } = table();
    const scourge = spawn(game, "Eternal Scourge", A);
    const shock = toHand(game, "Shock", B);
    lands(game, "Mountain", 1, B);
    lands(game, "Wastes", 3, A);
    toStep(game, "begin-combat", A);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, shock, { player: B, targets: [ref(scourge)] });
    expect(zone(game, scourge)).toBe("exile");
    aliceAgain(game);
    expect(castsOf(game.legalActions(A), scourge)).toHaveLength(1);
    cast(game, scourge, { via: "impulse" });
    expect(zone(game, scourge)).toBe("battlefield");
  });
});

describe("Idol of Endurance — one free spell from a linked exile", () => {
  const withIdol = () => {
    const t = table();
    const bear = toGraveyard(t.game, "Grizzly Bears", A);
    const elf = toGraveyard(t.game, "Llanowar Elves", A);
    const big = toGraveyard(t.game, "Colossal Dreadmaw", A);
    const spell = toGraveyard(t.game, "Divination", A);
    const theirs = toGraveyard(t.game, "Savannah Lions", B);
    const idol = enter(t.game, "Idol of Endurance", A);
    settle(t.game);
    return { ...t, idol, bear, elf, big, spell, theirs };
  };

  it("exiles only your creature cards of mana value 3 or less", () => {
    const { game, bear, elf, big, spell, theirs } = withIdol();
    expect(zone(game, bear)).toBe("exile");
    expect(zone(game, elf)).toBe("exile");
    expect(zone(game, big)).toBe("graveyard");
    expect(zone(game, spell)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("they go back to the graveyard when the Idol leaves", () => {
    const { game, idol, bear, elf } = withIdol();
    destroy(game, idol);
    settle(game);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, elf)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(bear);
  });

  it("nothing is castable until it's activated; then one creature spell, free, and no second", () => {
    const { game, idol, bear, elf } = withIdol();
    expect(castsOf(game.legalActions(A), bear)).toHaveLength(0);
    lands(game, "Plains", 2, A);
    activate(game, idol);
    expect(castsOf(game.legalActions(A), bear)).toHaveLength(1);
    expect(castsOf(game.legalActions(A), elf)).toHaveLength(1);
    // Paying isn't on offer: only the free cast.
    expect(() => game.dispatch({ type: "cast-spell", player: A, card: bear, targets: [], via: "impulse" })).toThrow();
    cast(game, bear, { via: "impulse", free: true });
    expect(zone(game, bear)).toBe("battlefield");
    expect(castsOf(game.legalActions(A), elf)).toHaveLength(0);
  });

  it("each activation is one spell: two resolved, two cast", () => {
    const { game, idol, bear, elf } = withIdol();
    lands(game, "Plains", 4, A);
    activate(game, idol);
    game.state.objects[idol].tapped = false;
    activate(game, idol);
    cast(game, bear, { via: "impulse", free: true });
    expect(castsOf(game.legalActions(A), elf)).toHaveLength(1);
    cast(game, elf, { via: "impulse", free: true });
    expect(zone(game, elf)).toBe("battlefield");
  });

  it("the permission ends with the turn", () => {
    const { game, idol, bear } = withIdol();
    lands(game, "Plains", 2, A);
    activate(game, idol);
    aliceAgain(game);
    expect(castsOf(game.legalActions(A), bear)).toHaveLength(0);
    expect(zone(game, bear)).toBe("exile");
  });

  it("a card cast and died comes back no more: it isn't linked to the Idol now", () => {
    const { game, idol, bear } = withIdol();
    lands(game, "Plains", 2, A);
    activate(game, idol);
    cast(game, bear, { via: "impulse", free: true });
    destroy(game, bear);
    settle(game);
    expect(zone(game, bear)).toBe("graveyard");
    destroy(game, idol);
    settle(game);
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("an adventure's instant half isn't a creature spell", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Bonecrusher Giant", A);
    const idol = enter(game, "Idol of Endurance", A);
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    lands(game, "Plains", 2, A);
    activate(game, idol);
    const offers = castsOf(game.legalActions(A), giant) as readonly Extract<LegalAction, { kind: "cast-spell" }>[];
    expect(offers.map((o) => o.cardName)).toEqual(["Bonecrusher Giant"]);
  });
});

describe("Planeswalker's Mischief", () => {
  it("an instant or sorcery revealed is exiled, free to cast, and back in hand at the end step if not cast", () => {
    const { game, a } = table();
    const mischief = spawn(game, "Planeswalker's Mischief", A);
    emptyHand(game, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Island", 4, A);
    pickTargets(a, B);
    activate(game, mischief, 0, { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("exile");
    expect(castsOf(game.legalActions(A), bolt)).not.toHaveLength(0);
    nextTurn(game);
    expect(zone(game, bolt)).toBe("hand");
    expect(hand(game, B)).toContain(bolt);
  });

  it("cast, it doesn't come back, and it's cast for nothing", () => {
    const { game, a } = table();
    const mischief = spawn(game, "Planeswalker's Mischief", A);
    emptyHand(game, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Island", 4, A);
    pickTargets(a, B);
    activate(game, mischief, 0, { targets: [ref(B)] });
    cast(game, bolt, { via: "impulse", free: true, targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(graveyard(game, B)).toContain(bolt);
    nextTurn(game);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("anything else revealed stays in the hand", () => {
    const { game, a } = table();
    const mischief = spawn(game, "Planeswalker's Mischief", A);
    emptyHand(game, B);
    const bear = toHand(game, "Grizzly Bears", B);
    lands(game, "Island", 4, A);
    pickTargets(a, B);
    activate(game, mischief, 0, { targets: [ref(B)] });
    expect(zone(game, bear)).toBe("hand");
  });

  it("activates only as a sorcery", () => {
    const { game } = table();
    const mischief = spawn(game, "Planeswalker's Mischief", A);
    lands(game, "Island", 4, A);
    toStep(game, "begin-combat", A);
    expect(game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === mischief)).toBe(false);
  });
});

describe("Panglacial Wurm — cast while searching your library", () => {
  it("is offered as the search starts, at its cost, with the library looked at; the search goes on; the spell resolves after", () => {
    const { game, a } = table();
    const wurm = toLibrary(game, "Panglacial Wurm", A);
    const find = toLibrary(game, "Forest", A);
    lands(game, "Forest", 9, A);
    const tutor = toHand(game, "Rampant Growth", A);
    let offer: CastNowOffer | undefined;
    a.chooseCastNowFn = (_v, o): Cast => {
      offer = o;
      return { type: "cast-spell", player: A, card: wurm, targets: [], via: "effect" };
    };
    pickFromZone(a, find);
    cast(game, tutor);
    expect(offer?.cards).toEqual([wurm]);
    expect(offer?.looked).toContain(find);
    expect(offer?.free).toBe(false);
    expect(zone(game, find)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("battlefield");
  });

  it("declined, the search simply goes on", () => {
    const { game, a } = table();
    const wurm = toLibrary(game, "Panglacial Wurm", A);
    const find = toLibrary(game, "Forest", A);
    lands(game, "Forest", 9, A);
    const tutor = toHand(game, "Rampant Growth", A);
    a.chooseCastNowFn = () => null;
    pickFromZone(a, find);
    cast(game, tutor);
    expect(zone(game, find)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("library");
  });

  it("without the mana nothing is asked, and it isn't castable outside a search", () => {
    const { game, a } = table();
    const wurm = toLibrary(game, "Panglacial Wurm", A);
    const find = toLibrary(game, "Forest", A);
    lands(game, "Forest", 2, A);
    const tutor = toHand(game, "Rampant Growth", A);
    expect(castsOf(game.legalActions(A), wurm)).toHaveLength(0);
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    pickFromZone(a, find);
    cast(game, tutor);
    expect(asked).toBe(false);
    expect(zone(game, find)).toBe("battlefield");
  });

  it("not while searching someone else's library", () => {
    const { game, a } = table();
    const wurm = toLibrary(game, "Panglacial Wurm", A);
    lands(game, "Island", 12, A);
    const scheme = toHand(game, "Bribery", A);
    toLibrary(game, "Grizzly Bears", B);
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    a.chooseFromZoneFn = () => [];
    cast(game, scheme, { targets: [ref(B)] });
    expect(asked).toBe(false);
    expect(zone(game, wurm)).toBe("library");
    expect(named(game, "Panglacial Wurm")).toHaveLength(0);
  });
});
