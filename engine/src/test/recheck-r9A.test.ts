/**
 * Recheck list R9, group A (batch B243): each card's clause most likely to be
 * wrong — mostly "whenever this deals damage" once per damage event, and the
 * "when you sacrifice this" trigger.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  grant,
  keywords,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const stack = (game: Game): readonly ObjectId[] => game.state.zones.shared.stack;

/** Alice's `attacker` attacks bob and is blocked by `blocker`; runs until
 * combat damage has put something on the stack. */
function tradeUntilTrigger(
  t: ReturnType<typeof table>,
  attacker: ObjectId,
  ...blockers: readonly ObjectId[]
): void {
  t.a.declareAttackersFn = () => [{ attacker, defender: B }];
  t.b.declareBlockersFn = () => blockers.map((blocker) => ({ blocker, attacker }));
  t.game.advanceUntil((s) => s.turn.step === "combat-damage" && s.zones.shared.stack.length > 0);
}

describe("Olivia's Attendants", () => {
  it("its damage to two blockers at once is one trigger, for the total", () => {
    const t = table();
    const { game } = t;
    const attendants = spawn(game, "Olivia's Attendants");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    tradeUntilTrigger(t, attendants, one, two);
    expect(stack(game)).toHaveLength(1);
    expect(game.state.objects[stack(game)[0]].triggerValue).toBe(6);
    settle(game);
    expect(tokensNamed(game, "Blood Token", A)).toBe(6);
  });
});

describe("Cecil, Dark Knight", () => {
  it("loses the total once, then untaps and transforms at half life", () => {
    const t = table();
    const { game } = t;
    game.state.players[A].life = 12;
    const cecil = spawn(game, "Cecil, Dark Knight");
    grant(game, cecil, "trample");
    const elves = spawn(game, "Llanowar Elves", B);
    tradeUntilTrigger(t, cecil, elves);
    expect(stack(game)).toHaveLength(1);
    expect(game.state.objects[stack(game)[0]].triggerValue).toBe(2);
    settle(game);
    expect(life(game, A)).toBe(10);
    expect(printedCardName(game.state.objects[cecil])).toBe("Cecil, Redeemed Paladin");
    expect(game.state.objects[cecil].tapped).toBe(false);
  });

  it("stays a Dark Knight above half life", () => {
    const t = table();
    const { game } = t;
    const cecil = spawn(game, "Cecil, Dark Knight");
    t.a.declareAttackersFn = () => [{ attacker: cecil, defender: B }];
    toStep(game, "postcombat-main");
    expect(life(game, A)).toBe(18);
    expect(printedCardName(game.state.objects[cecil])).toBe("Cecil, Dark Knight");
  });
});

describe("The Red Terror", () => {
  it("gets one counter for a red trampler hitting its blocker and the player at once", () => {
    const t = table();
    const { game } = t;
    const terror = spawn(game, "The Red Terror");
    grant(game, terror, "trample");
    const elves = spawn(game, "Llanowar Elves", B);
    tradeUntilTrigger(t, terror, elves);
    settle(game);
    expect(counters(game, terror)).toBe(1);
  });
});

describe("Quintessential Katana", () => {
  it("the equipped creature's combat damage to a blocker and a player untaps it and gains 2 once", () => {
    const t = table();
    const { game } = t;
    const katana = spawn(game, "Quintessential Katana");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[katana].attachedTo = bears;
    grant(game, bears, "trample");
    const elves = spawn(game, "Llanowar Elves", B);
    t.a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    t.b.declareBlockersFn = () => [{ blocker: elves, attacker: bears }];
    toStep(game, "postcombat-main");
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Dropkick Bomber", () => {
  it("the Goblin it bombs flies and is sacrificed after dealing combat damage", () => {
    const t = table();
    const { game } = t;
    const bomber = spawn(game, "Dropkick Bomber");
    const goblin = spawn(game, "Raging Goblin");
    lands(game, "Mountain", 1);
    activate(game, bomber, 0, { targets: [ref(goblin)] });
    expect(keywords(game, goblin).has("flying")).toBe(true);
    t.a.declareAttackersFn = () => [{ attacker: goblin, defender: B }];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(18);
    expect(zone(game, goblin)).toBe("graveyard");
    expect(zone(game, bomber)).toBe("battlefield");
  });
});

describe("Darien, King of Kjeldor", () => {
  it("two attackers hitting you at once are one trigger, for that many Soldiers", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Darien, King of Kjeldor");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    let asked = 0;
    t.a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    nextTurn(game);
    t.b.declareAttackersFn = () => [
      { attacker: one, defender: A },
      { attacker: two, defender: A },
    ];
    toStep(game, "postcombat-main", B);
    expect(life(game, A)).toBe(16);
    expect(asked).toBe(1);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(4);
  });
});

describe("Michiko Konda, Truth Seeker", () => {
  it("an opponent's burn spell at you makes that opponent sacrifice a permanent", () => {
    const { game } = table();
    spawn(game, "Michiko Konda, Truth Seeker");
    const mine = spawn(game, "Grizzly Bears");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    spawn(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const before = game.battlefield.filter((id) => game.state.objects[id].controller === B).length;
    cast(game, bolt, { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(17);
    expect(game.battlefield.filter((id) => game.state.objects[id].controller === B)).toHaveLength(before - 1);
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Carrot Cake", () => {
  it("sacrificed to its own Food ability, makes a Rabbit and scries", () => {
    const { game } = table();
    const cake = spawn(game, "Carrot Cake");
    lands(game, "Plains", 2);
    activate(game, cake, 0);
    expect(zone(game, cake)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
    expect(tokensNamed(game, "Rabbit Token", A)).toBe(1);
  });
});

describe("Disturbing Mirth", () => {
  it("sacrificing another Mirth draws two, and that Mirth's own trigger manifests dread", () => {
    const { game, a } = table();
    const other = spawn(game, "Disturbing Mirth");
    const before = hand(game).length;
    pickModes(a, 0);
    const seen = pickPermanents(a, other);
    const mirth = enter(game, "Disturbing Mirth");
    expect(seen.offered).not.toContain(mirth);
    expect(zone(game, other)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
    expect(game.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined)).toHaveLength(1);
  });
});

describe("Biolume Egg", () => {
  it("sacrificed, it returns as Biolume Serpent at the next end step", () => {
    const { game } = table();
    const egg = spawn(game, "Biolume Egg");
    const seer = spawn(game, "Viscera Seer");
    game.dispatch({ type: "activate-ability", player: A, source: seer, abilityIndex: 0, targets: [], sacrifice: egg });
    settle(game);
    expect(zone(game, egg)).toBe("graveyard");
    toStep(game, "cleanup");
    settle(game);
    const serpent = named(game, "Biolume Egg", A)[0] ?? egg;
    expect(zone(game, serpent)).toBe("battlefield");
    expect(printedCardName(game.state.objects[serpent])).toBe("Biolume Serpent");
    expect(game.state.objects[serpent].controller).toBe(A);
  });
});

describe("Rashmi, Eternities Crafter", () => {
  it("casts a lesser top card free, and puts a bigger one into your hand", () => {
    const { game, a } = table();
    spawn(game, "Rashmi, Eternities Crafter");
    lands(game, "Forest", 4);
    const elves = toLibrary(game, "Llanowar Elves");
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === elves);
      return way === undefined ? null : { type: "cast-spell", player: A, card: elves, targets: [], via: way.via, free: true };
    };
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, elves)).toBe("battlefield");

    nextTurn(game);
    toStep(game, "precombat-main");
    const angel = toLibrary(game, "Serra Angel");
    const handBefore = hand(game).length;
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, angel)).toBe("hand");
    expect(hand(game).length).toBe(handBefore + 1);
  });
});

describe("Hooded Blightfang", () => {
  it("destroys a planeswalker a deathtouch creature of yours deals damage to", () => {
    const { game } = table();
    const fang = spawn(game, "Hooded Blightfang");
    const jace = spawn(game, "Jace Beleren", B);
    game.state.objects[jace].counters.loyalty = 5;
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(jace)], { source: fang });
    settle(game);
    expect(zone(game, jace)).toBe("graveyard");
  });
});

describe("Visions of Brutality", () => {
  it("the enchanted creature's controller loses the total once", () => {
    const t = table();
    const { game } = t;
    const visions = spawn(game, "Visions of Brutality", B);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[visions].attachedTo = bears;
    grant(game, bears, "trample");
    const elves = spawn(game, "Llanowar Elves", B);
    tradeUntilTrigger(t, bears, elves);
    expect(stack(game)).toHaveLength(1);
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(19);
  });
});
