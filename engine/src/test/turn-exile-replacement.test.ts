/**
 * Would-be-put-into-a-graveyard replacements a resolved spell or ability makes
 * for the turn (rule 614.1a, `player-effect`'s `graveyardExile`): Malicious
 * Eclipse, Malicious Malfunction, Gaea's Will, Magus of the Will, Cosmic
 * Intervention. And a creature's own "if this creature would die, exile it
 * instead" (rule 700.4 — Wildwood Escort).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  grant,
  graveyard,
  hand,
  lands,
  named,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("a replacement for the turn: creatures would die", () => {
  it("Malicious Eclipse shrinks everything and exiles only an opponent's creatures, for this turn", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Malicious Eclipse"));
    // -2/-2 kills both: mine goes to the graveyard, theirs to exile.
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("exile");
  });

  it("covers a creature that enters later, for any reason it dies, and ends with the turn", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Malicious Eclipse"));
    // Arrived after it resolved, so not shrunk; destroyed, not shrunk to death.
    const later = spawn(game, "Grizzly Bears", B);
    destroy(game, later, A);
    expect(zone(game, later)).toBe("exile");
    // A card merely put into a graveyard isn't dying (rule 700.4).
    const milled = toLibrary(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "mill", amount: 1, target: 0 }, [ref(B)]);
    settle(game);
    expect(zone(game, milled)).toBe("graveyard");

    nextTurn(game);
    const tomorrow = spawn(game, "Grizzly Bears", B);
    destroy(game, tomorrow, A);
    expect(zone(game, tomorrow)).toBe("graveyard");
  });

  it("reads a creature's controller as it would die: one of mine an opponent has taken is exiled", () => {
    const { game } = table();
    const stolen = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: true }, [ref(stolen)]);
    settle(game);
    lands(game, "Swamp", 3);
    // Grown out of the -2/-2's reach, then destroyed.
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 5, toughness: 5, duration: "end-of-turn" }, [ref(stolen)]);
    cast(game, toHand(game, "Malicious Eclipse"));
    expect(zone(game, stolen)).toBe("battlefield");
    destroy(game, stolen, A);
    expect(zone(game, stolen)).toBe("exile");
  });

  it("Malicious Malfunction exiles everybody's, and a dies trigger doesn't fire", () => {
    const { game } = table();
    const goblin = spawn(game, "Festering Goblin", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Malicious Malfunction"));
    expect(zone(game, goblin)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });
});

describe("a replacement for the turn: cards would go to your graveyard (Magus of the Will, Gaea's Will)", () => {
  /** The Magus's ability, resolved, once `before` has put what the test wants
   * into a graveyard: from then on nothing of alice's gets there. */
  function willActive(before: (game: Game) => void = () => {}): ReturnType<typeof table> {
    const t = table();
    before(t.game);
    const magus = spawn(t.game, "Magus of the Will", A);
    lands(t.game, "Swamp", 3);
    activate(t.game, magus);
    expect(zone(t.game, magus)).toBe("exile");
    return t;
  }

  it("lets a land be played and a spell cast from the graveyard, each by its usual rules and paid for", () => {
    let land = "" as ObjectId;
    let spell = "" as ObjectId;
    const { game } = willActive((g) => {
      land = toGraveyard(g, "Forest", A);
      spell = toGraveyard(g, "Grizzly Bears", A);
    });
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const offers = game.legalActions(A);
    expect(offers.some((x) => x.kind === "play-land" && x.card === land)).toBe(true);
    expect(offers.some((x) => x.kind === "cast-spell" && x.card === theirs)).toBe(false);
    game.dispatch({ type: "play-land", player: A, card: land });
    expect(zone(game, land)).toBe("battlefield");
    // No mana yet: it's the card's cost to pay.
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === spell)).toBe(false);
    lands(game, "Forest", 2);
    const offer = game.legalActions(A).find((x) => x.kind === "cast-spell" && x.card === spell);
    if (offer?.kind !== "cast-spell") throw new Error("not offered");
    cast(game, spell, { via: offer.via, graveyardGrant: offer.graveyardGrant });
    expect(zone(game, spell)).toBe("battlefield");
  });

  it("exiles every card of yours bound for the graveyard, from anywhere; tokens die, an opponent's cards don't", () => {
    const { game } = willActive();
    // From the library.
    const milled = toLibrary(game, "Forest", A);
    game.debugApplyEffect(A, { kind: "mill", amount: 1, target: 0 }, [ref(A)]);
    settle(game);
    expect(zone(game, milled)).toBe("exile");
    // A spell that has resolved.
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt", A);
    cast(game, bolt, { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("exile");
    // A permanent, even one nobody played from the graveyard.
    const bears = spawn(game, "Grizzly Bears", A);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
    // A token goes to the graveyard as normal.
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    const before = game.eventsOfType("permanent-destroyed").length;
    destroy(game, named(game, "Soldier Token", A)[0]);
    expect(game.eventsOfType("permanent-destroyed").length).toBe(before + 1);
    expect(game.eventsOfType("graveyard-replaced-with-exile").at(-1)?.object).toBe(bears);
    // An opponent's card goes to their graveyard.
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, theirs, A);
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("ends with the turn: the permission and the replacement both", () => {
    let land = "" as ObjectId;
    const { game } = willActive((g) => {
      land = toGraveyard(g, "Forest", A);
    });
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === land)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === land)).toBe(false);
    const bears = spawn(game, "Grizzly Bears", A);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Gaea's Will can only be suspended; cast for free, it exiles itself as it finishes resolving", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const land = toGraveyard(game, "Forest", A);
    const will = toHand(game, "Gaea's Will", A);
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === will)).toBe(false);
    game.dispatch({ type: "suspend", player: A, card: will });
    expect(game.state.objects[will].counters.time).toBe(4);
    a.chooseCastNowFn = (_view, offer) =>
      offer.casts.some((c) => c.card === will)
        ? { type: "cast-spell", player: A, card: will, targets: [], via: "effect" as const, free: true }
        : null;
    game.advanceUntil(
      (s) => s.turn.step === "precombat-main" && s.objects[will].zone === "exile" && (s.objects[will].counters.time ?? 0) === 0 && (s.playerEffects ?? []).length > 0,
    );
    expect(game.eventsOfType("spell-cast").some((e) => e.object === will && e.via === "suspend")).toBe(true);
    expect(graveyard(game, A)).not.toContain(will);
    expect(game.state.objects[will].zone).toBe("exile");
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === land)).toBe(true);
  });
});

describe("a replacement for the turn that brings the permanent back (Cosmic Intervention)", () => {
  it("exiles what would die and returns each at the next end step, under its owner's control; a token is gone", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const elves = spawn(game, "Llanowar Elves", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    const token = named(game, "Soldier Token", A)[0];
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Cosmic Intervention"));

    destroy(game, bears);
    destroy(game, elves);
    destroy(game, token);
    destroy(game, theirs, A);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, elves)).toBe("exile");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);

    // Milled, it's no business of this: "from the battlefield".
    const card = toLibrary(game, "Grizzly Bears", A);
    game.debugApplyEffect(B, { kind: "mill", amount: 1, target: 0 }, [ref(A)]);
    settle(game);
    expect(zone(game, card)).toBe("graveyard");

    // Each its own trigger (the ruling).
    expect(game.state.delayedTriggers).toHaveLength(2);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });

  it("a stolen permanent comes back under its owner's control", () => {
    const { game } = table();
    const stolen = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: true }, [ref(stolen)]);
    settle(game);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Cosmic Intervention"));
    destroy(game, stolen);
    expect(zone(game, stolen)).toBe("exile");
    nextTurn(game);
    expect(zone(game, stolen)).toBe("battlefield");
    expect(game.state.objects[stolen].controller).toBe(B);
  });
});

describe("a replacement that does something besides (`then`)", () => {
  it("Head of the Hunt: exiled instead, and a Wolf by a trigger on the stack; only an opponent's dying creature", () => {
    const { game } = table();
    spawn(game, "Head of the Hunt", A);
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(theirs)]);
    // Exiled at once; the Wolf is the "when you do", on the stack.
    expect(zone(game, theirs)).toBe("exile");
    expect(tokensNamed(game, "Wolf Token", A)).toBe(0);
    settle(game);
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);

    destroy(game, mine);
    expect(zone(game, mine)).toBe("graveyard");
    const milled = toLibrary(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "mill", amount: 1, target: 0 }, [ref(B)]);
    settle(game);
    expect(zone(game, milled)).toBe("graveyard");
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
  });

  it("every token of a stack that dies at once is a Wolf", () => {
    const { game } = table();
    grant(game, spawn(game, "Head of the Hunt", A), "indestructible");
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 3 }, []);
    settle(game);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Wrath of God"));
    expect(tokensNamed(game, "Soldier Token", B)).toBe(0);
    expect(tokensNamed(game, "Wolf Token", A)).toBe(3);
  });

  it("Rest in Peace beside it: its controller's opponent picks the exile with no Wolf (rule 616.1)", () => {
    const { game } = table();
    spawn(game, "Head of the Hunt", A);
    spawn(game, "Rest in Peace", B);
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, theirs, A);
    expect(zone(game, theirs)).toBe("exile");
    expect(tokensNamed(game, "Wolf Token", A)).toBe(0);
  });

  it("gone with what it exiles: a wrath that takes Head of the Hunt too still exiles and still makes Wolves", () => {
    const { game } = table();
    spawn(game, "Head of the Hunt", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Wrath of God"));
    expect(zone(game, theirs)).toBe("exile");
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
  });

  it("Kalitas: the Zombie comes as part of the replacement, for a nontoken only", () => {
    const { game } = table();
    const kalitas = spawn(game, "Kalitas, Traitor of Ghet", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(theirs)]);
    expect(zone(game, theirs)).toBe("exile");
    expect(game.state.zones.shared.stack).toHaveLength(0);
    settle(game);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);

    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    destroy(game, named(game, "Soldier Token", B)[0], A);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);

    // Its own ability: another Vampire or Zombie, the Zombie just made.
    lands(game, "Swamp", 3);
    game.dispatch({ type: "activate-ability", player: A, source: kalitas, abilityIndex: 0, targets: [], sacrifice: named(game, "Zombie Token", A)[0] });
    settle(game);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
    expect(game.state.objects[kalitas].counters["+1/+1"]).toBe(2);
    // Not itself, a Vampire though it is (its ruling): nothing else to sacrifice.
    lands(game, "Swamp", 3);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: kalitas, abilityIndex: 0, targets: [], sacrifice: kalitas }),
    ).not.toBeNull();
  });
});

describe("Kumano's Blessing", () => {
  it("exiles a creature its enchanted creature damaged this turn, and not one it didn't", () => {
    const { game, a, b } = table();
    const host = spawn(game, "Giant Spider", A);
    const damaged = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    pickTargets(a, host);
    cast(game, toHand(game, "Kumano's Blessing"), { targets: [ref(host)] });
    b.declareBlockersFn = () => [{ blocker: damaged, attacker: host }];
    attack(game, a, [host]);
    expect(zone(game, damaged)).toBe("exile");
    destroy(game, other);
    expect(zone(game, other)).toBe("graveyard");
  });
});

describe("a creature's own 'if this creature would die, exile it instead' (Wildwood Escort)", () => {
  it("exiles it from the battlefield only", () => {
    const { game } = table();
    const escort = spawn(game, "Wildwood Escort", A);
    destroy(game, escort);
    expect(zone(game, escort)).toBe("exile");

    // Milled: it goes to the graveyard, as it does countered.
    const milled = toLibrary(game, "Wildwood Escort", B);
    game.debugApplyEffect(A, { kind: "mill", amount: 1, target: 0 }, [ref(B)]);
    settle(game);
    expect(zone(game, milled)).toBe("graveyard");
  });

  it("goes to the graveyard when it's countered", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    lands(game, "Island", 2, B);
    const escort = toHand(game, "Wildwood Escort", A);
    const counter = toHand(game, "Cancel", B);
    lands(game, "Island", 1, B);
    cast(game, escort, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, counter, { player: B, targets: [ref(escort)] });
    expect(zone(game, escort)).toBe("graveyard");
  });

  it("its enters ability returns a creature card from your graveyard", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", A);
    pickTargets(a, bears);
    enter(game, "Wildwood Escort", A);
    expect(hand(game, A)).toContain(bears);
  });
});
