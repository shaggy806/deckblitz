/**
 * Batch 262, group B: cards freed by the need-keys families (graveyard order, the
 * turn's blocks, turning face up, pack tactics, companions, token replacements). One
 * test for the clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  attack,
  B,
  cast,
  controller,
  destroy,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

const castable = (game: Game, card: ObjectId, targets: readonly (PlayerId | ObjectId)[] = [], player: PlayerId = A): boolean =>
  game.canDispatch({ type: "cast-spell", player, card, targets: targets.map(ref) } as Action) === null;
const addCounter = (game: Game, id: ObjectId, counter: string, amount = 1): void =>
  game.debugApplyEffect(controller(game, id), { kind: "add-counter", target: 0, counter, amount }, [ref(id)]);

describe("graveyard order", () => {
  it("Bone Dancer takes the top creature card of the defending player's graveyard and deals no damage", () => {
    const { game, a } = table();
    const dancer = spawn(game, "Bone Dancer");
    const bottom = toGraveyard(game, "Hill Giant", B);
    const top = toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Shock", B);
    pickModes(a, 0);
    attack(game, a, [dancer]);
    expect(zone(game, top)).toBe("battlefield");
    expect(controller(game, top)).toBe(A);
    expect(zone(game, bottom)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("Mistmoon Griffin exiles itself first, then returns the top creature card under it", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant");
    const griffin = spawn(game, "Mistmoon Griffin");
    destroy(game, griffin);
    expect(zone(game, giant)).toBe("battlefield");
    expect(named(game, "Mistmoon Griffin").every((id) => zone(game, id) === "exile")).toBe(true);
  });

  it("Gyruda puts an even-mana-value creature card milled from any library onto the battlefield under you", () => {
    const { game } = table();
    const bears = toLibrary(game, "Grizzly Bears", B);
    enter(game, "Gyruda, Doom of Depths");
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });
});

describe("the turn's blocks", () => {
  it("Fyndhorn Druid gains 4 life only when it died having been blocked", () => {
    const { game, a, b } = table();
    const druid = spawn(game, "Fyndhorn Druid");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: druid }];
    attack(game, a, [druid]);
    expect(zone(game, druid)).toBe("graveyard");
    expect(life(game, A)).toBe(24);

    const other = spawn(game, "Fyndhorn Druid");
    destroy(game, other);
    expect(life(game, A)).toBe(24);
  });

  it("Cathedral Membrane dying in combat deals 6 to the creature it blocked, not to others", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const membrane = spawn(game, "Cathedral Membrane", B);
    b.declareBlockersFn = () => [{ blocker: membrane, attacker: giant }];
    attack(game, a, [giant, bears]);
    expect(zone(game, membrane)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Heat Stroke destroys the blocker and leaves the unblocked attacker", () => {
    const { game, a, b } = table();
    spawn(game, "Heat Stroke", B);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const blocker = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears, giant]);
    expect(zone(game, blocker)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("Inferno Hellion is shuffled into its owner's library at the end step after attacking", () => {
    const { game, a } = table();
    const hellion = spawn(game, "Inferno Hellion");
    const idle = spawn(game, "Inferno Hellion");
    attack(game, a, [hellion]);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Inferno Hellion").filter((id) => zone(game, id) === "battlefield")).toEqual([idle]);
  });

  it("Lurker can't be targeted by spells until it attacked this turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const lurker = spawn(game, "Lurker");
    const shock = toHand(game, "Shock");
    expect(castable(game, shock, [lurker])).toBe(false);
    attack(game, a, [lurker]);
    expect(castable(game, shock, [lurker])).toBe(true);
  });

  it("Vizier of Deferment exiles only a creature that attacked or blocked, until the end step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const idle = spawn(game, "Hill Giant");
    attack(game, a, [bears]);
    pickModes(a, 0);
    a.chooseTargetsFn = () => [ref(idle)];
    enter(game, "Vizier of Deferment");
    expect(zone(game, idle)).toBe("battlefield");
    a.chooseTargetsFn = () => [ref(bears)];
    enter(game, "Vizier of Deferment");
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears").some((id) => zone(game, id) === "battlefield")).toBe(true);
  });

  it("Gideon's Triumph makes the opponent sacrifice a creature that blocked this turn", () => {
    const { game, a, b } = table();
    const attacker = spawn(game, "Hill Giant");
    const blocker = spawn(game, "Grizzly Bears", B);
    const idle = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker, attacker }];
    grantIndestructibleBears(game, blocker);
    attack(game, a, [attacker]);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Gideon's Triumph"), { targets: [ref(B)] });
    expect(zone(game, blocker)).toBe("graveyard");
    expect(zone(game, idle)).toBe("battlefield");
  });
});

function grantIndestructibleBears(game: Game, id: ObjectId): void {
  game.debugApplyEffect(controller(game, id), { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" }, [ref(id)]);
}

describe("turning face up", () => {
  it("Zimone manifests dread on the first landfall and offers a face-up turn on the second", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Hill Giant");
    spawn(game, "Zimone, Mystery Unraveler");
    enter(game, "Forest");
    const faceDown = Object.values(game.state.objects).filter((o) => o.zone === "battlefield" && o.faceDown !== undefined);
    expect(faceDown).toHaveLength(1);
    const seen = pickPermanents(a, faceDown[0].id);
    enter(game, "Forest");
    expect(seen.offered).toEqual([faceDown[0].id]);
    expect(game.state.objects[faceDown[0].id].faceDown).toBeUndefined();
  });
});

describe("life and protection", () => {
  it("Courageous Resolve's fateful hour stops life loss at 5 or less", () => {
    const { game } = table({ life: 5 });
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Courageous Resolve"), { targets: [null] });
    game.debugApplyEffect(B, { kind: "lose-life", amount: 3, who: "each-opponent" }, []);
    settle(game);
    expect(life(game, A)).toBe(5);
  });

  it("Knight of the Holy Nimbus regenerates instead of being destroyed", () => {
    const { game } = table();
    const knight = spawn(game, "Knight of the Holy Nimbus");
    destroy(game, knight);
    expect(zone(game, knight)).toBe("battlefield");
    expect(game.state.objects[knight].tapped).toBe(true);
  });
});

describe("copies and tokens", () => {
  it("Leyline of Resonance copies a spell that targets only one creature you control", () => {
    const { game } = table();
    spawn(game, "Leyline of Resonance");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(pt(game, bears).power).toBe(8);
  });

  it("Hare Apparent makes a Rabbit for each other Hare Apparent", () => {
    const { game } = table();
    spawn(game, "Hare Apparent");
    spawn(game, "Hare Apparent");
    enter(game, "Hare Apparent");
    expect(tokensNamed(game, "Rabbit Token", A)).toBe(2);
  });

  it("Quina adds one Frog to a token creation", () => {
    const { game } = table();
    spawn(game, "Quina, Qu Gourmet");
    game.debugApplyEffect(A, { kind: "create-token", token: "Rabbit Token", count: 2 }, []);
    settle(game);
    expect(tokensNamed(game, "Rabbit Token", A)).toBe(2);
    expect(tokensNamed(game, "Frog Token", A)).toBe(1);
  });

  it("Toby's tokens fly once you control four creature tokens", () => {
    const { game } = table();
    enter(game, "Toby, Beastie Befriender");
    const beast = named(game, "Beast Token (Can't Attack or Block Alone)")[0];
    expect(keywords(game, beast).has("flying")).toBe(false);
    game.debugApplyEffect(A, { kind: "create-token", token: "Rabbit Token", count: 3 }, []);
    settle(game);
    expect(keywords(game, beast).has("flying")).toBe(true);
  });

  it("Yorion exiles the chosen permanents together and returns them at the end step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    const seen = pickPermanents(a, bears, giant);
    enter(game, "Yorion, Sky Nomad");
    expect(seen.offered).not.toContain(theirs);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears").some((id) => zone(game, id) === "battlefield")).toBe(true);
    expect(named(game, "Hill Giant", A).some((id) => zone(game, id) === "battlefield")).toBe(true);
  });

  it("Construct a Cosmic Cube is sacrificed at its seventh plan counter", () => {
    const { game } = table();
    const cube = spawn(game, "Construct a Cosmic Cube");
    addCounter(game, cube, "plan", 6);
    settle(game);
    expect(zone(game, cube)).toBe("battlefield");
    addCounter(game, cube, "plan", 1);
    settle(game);
    expect(named(game, "Construct a Cosmic Cube").some((id) => zone(game, id) === "battlefield")).toBe(false);
    expect(graveyard(game, A).some((id) => game.state.objects[id].cardName === "Construct a Cosmic Cube")).toBe(true);
  });
});

describe("join forces", () => {
  it("Collective Voyage: each player searches for up to the total paid, tapped", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 3);
    lands(game, "Forest", 1, B);
    const before = [A, B].map((p) => named(game, "Wastes", p).filter((id) => zone(game, id) === "battlefield").length);
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    b.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    cast(game, toHand(game, "Collective Voyage"), { settle: false });
    for (const [player, amount] of [[A, 2], [B, 1]] as const) {
      game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
      game.dispatch({ type: "choose-modes", player, modes: [0], xValue: amount } as Action);
    }
    settle(game);
    const after = [A, B].map((p) => named(game, "Wastes", p).filter((id) => zone(game, id) === "battlefield"));
    expect(after.map((ids, i) => ids.length - before[i])).toEqual([3, 3]);
    expect(after[0].every((id) => game.state.objects[id].tapped === true)).toBe(true);
  });
});
